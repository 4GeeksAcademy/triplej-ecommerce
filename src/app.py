"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory, abort
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from api.utils import APIException, generate_sitemap, print_stderr
from api.models import db, Product, User, Order, Favorite, OrderItem, prod_order, user_order, RoleEnum
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from sqlalchemy import text, func
import sys
import traceback

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

app.config["JWT_SECRET_KEY"] = "super-secret-key"  # contrasena para los tokens
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)
def _reset_user_id_sequence_once():
    if db.engine.url.get_backend_name() != "postgresql":
        return
    try:
        db.session.execute(text("""
            SELECT setval(
              pg_get_serial_sequence('"user"', 'id'),
              COALESCE((SELECT MAX(id) FROM "user"), 0),
              true
            );
        """))
        db.session.commit()
        print("[SEQ] 'user'.id sequence reseteada ✅")
    except Exception as e:
        db.session.rollback()
        print("[SEQ] No se pudo resetear la secuencia:", e)

# ▶️ Lánzalo una sola vez al cargar la app
with app.app_context():
    _reset_user_id_sequence_once()


def _reset_user_id_sequence_once():
    if db.engine.url.get_backend_name() != "postgresql":
        return
    try:
        db.session.execute(text("""
            SELECT setval(
              pg_get_serial_sequence('"user"', 'id'),
              COALESCE((SELECT MAX(id) FROM "user"), 0),
              true
            );
        """))
        db.session.commit()
        print("[SEQ] 'user'.id sequence reseteada ✅")
    except Exception as e:
        db.session.rollback()
        print("[SEQ] No se pudo resetear la secuencia:", e)


# ▶️ Lánzalo una sola vez al cargar la app
with app.app_context():
    _reset_user_id_sequence_once()

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = db.session.execute(db.select(User)).scalars().all()
        print("all users: ", users)
        if not users:
            abort(404, description="User not found")
        result = [user.serialize() for user in users]
        return jsonify(result), 200

    except Exception as e:
        raise APIException(str(e), status_code=500)


@app.route('/users', methods=['POST'])
def add_users():
    try:
        users = request.get_json()
        print("Request body: ", users)
        new_users = [User(**user) for user in users]

        db.session.add_all(new_users)
        db.session.commit()

        serialized_users = [user.serialize() for user in new_users]

        return jsonify(serialized_users), 201
    except Exception as e:
        db.session.rollback()
        raise APIException(str(e), status_code=500)


@app.route('/products', methods=['POST'])
def add_products():
    try:
        products = request.get_json()
        print("Request body: ", products)
        new_prods = [Product(**prod) for prod in products]

        db.session.add_all(new_prods)
        db.session.commit()

        serialized_prods = [prod.serialize() for prod in new_prods]

        return jsonify(serialized_prods), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(str(e), status_code=500)


@app.route('/orders', methods=['GET'])
def get_all_orders():
    try:
        orders = db.session.execute(db.select(Order)).scalars().all()
        print("all users: ", orders)
        if not orders:
            abort(404, description="User not found")
        result = [order.serialize() for order in orders]
        return jsonify(result), 200

    except Exception as e:
        raise APIException(str(e), status_code=500)


@app.route('/my-cart/<int:user_id>', methods=['GET'])
def get_orders(user_id):
    try:


        results = db.session.execute(
            db.select(Order, User, Product, OrderItem)
            .join(Order.users)
            .where(User.id == user_id)
            .join(Order.products)
            .join(Order.items)).all()

        orders_dict = {}
        for order, _, prod, order_item in results:

            if order.id not in orders_dict:
                order_info = order.serialize()
                order_info['products'] = []
                orders_dict[order.id] = order_info

            if any(p["product_details"]["id"] == prod.id for p in orders_dict[order.id]["products"]):
                continue

            orders_dict[order.id]['products'].append({
                "item_id": order_item.id,
                "quantity_ordered": order_item.quantity,
                "product_details": prod.serialize()
            })

        list_orders = list(orders_dict.values())

        return list_orders, 200
    except Exception as e:
        raise APIException(str(e), status_code=500)


@app.route('/my-cart', methods=['POST'])
def add_item_to_cart():
    try:
        request_body = request.get_json()
        if not request_body:
            abort(400, "Empty request body")

        item = request_body.get("item")
        if not item or "id" not in item:
            abort(400, "Invalid item data")

        user = request_body.get("currentUser")
        if not user or "id" not in user:
            abort(400, "Invalid user data")     
            
        user = db.session.execute(
            db.select(User).where(User.id == user["id"])
        ).scalar_one_or_none()
        if not user:
            abort(404, f"User with id={user['id']} not found.")

        product = db.session.execute(
            db.select(Product).where(Product.id == item["id"])
        ).scalar_one_or_none()
        if not product:
            abort(404, f"Product with id={item['id']} not found.")

        order = db.session.execute(
            db.select(Order)
            .join(Order.users)
            .where(User.id == user.id)
        ).scalar_one_or_none()

        if not order:
            order = Order()
            db.session.add(order)
            user.orders.append(order)
            product.orders.append(order)
            db.session.flush()

        existing_item = db.session.execute(
            db.select(OrderItem)
            .where(OrderItem.order_id == order.id)
            .where(OrderItem.prod_id == product.id)
        ).scalar_one_or_none()

        quantity = 1

        if existing_item is None:
            order_item = OrderItem(
                order_id=order.id,
                prod_id=item["id"],
                quantity=quantity
            )
            order.products.append(product)
            db.session.add(order_item)
        else:
            quantity = existing_item.quantity + 1
            db.session.execute(
                db.update(OrderItem)
                .where(OrderItem.id == existing_item.id)
                .values(quantity=quantity)
            )
        if quantity > product.amount:
            return jsonify({"message": "Aborted, there are not that amount of products in stock."})
        
        db.session.commit()

        return jsonify({
            "message": "Producto añadido al carrito correctamente.",
            "order_id": order.id,
            "prod_id": product.id,
            "quantity": quantity,
            "stock": product.amount
        }), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(str(e), status_code=500)


@app.route('/my-cart/<prod_id>', methods=['DELETE'])
def delete_prod_from_cart(prod_id):
    try:

        user = request.get_json().get("currentUser")

        product = db.session.execute(db.select(Product).where(
            Product.id == prod_id)).scalar_one_or_none()
        user = db.session.execute(db.select(User).where(
            User.id == user["id"])).scalar_one_or_none()

        order = db.session.execute(db.select(Order).join(
            Order.users).where(User.id == user["id"])).scalar_one_or_none()
        if order is None:
            abort(404, f'Order does not have a record with user_id = {user["id"]}.')
        order_item = db.session.execute(db.select(OrderItem).where(
            OrderItem.prod_id == prod_id).where(OrderItem.order_id == order.id)).scalar_one_or_none()
        if order_item is None:
            abort(
                404, f'OrderItem does not have a record with prod_id = {prod_id}.')

        count = db.session.execute(db.select(func.count(OrderItem.order_id)).where(
            OrderItem.order_id == order.id)).scalar_one_or_none()

        if count == 1:
            db.session.delete(order_item)
            order.products.remove(product)
            order.users.remove(user)
            db.session.delete(order)
        else:
            order.products.remove(product)
            db.session.delete(order_item)

        db.session.commit()

        return jsonify({"message": "Delete completed!"}), 200
    except Exception as e:
        raise APIException(str(e), status_code=500)


@app.route('/orders', methods=['POST'])
def add_orders():
    try:
        orders = request.get_json()
        print("Request body: ", orders)
        new_orders = [Order(**order) for order in orders]

        db.session.add_all(new_orders)
        db.session.commit()

        serialized_orders = [order.serialize() for order in new_orders]

        return jsonify(serialized_orders), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(str(e), status_code=500)


@app.route('/order_items', methods=['GET'])
def get_order_items():
    try:
        items = db.session.execute(db.select(OrderItem)).scalars().all()
        print_stderr(f"all users: ${items}")
        if not items:
            abort(404, description="Item not found")
        result = [item.serialize() for item in items]
        return jsonify(result), 200

    except Exception as e:
        raise APIException(str(e), status_code=500)


@app.route('/order_items', methods=['POST'])
def add_order_items():
    try:
        items = request.get_json()
        print("Request body: ", items)
        new_items = [OrderItem(**item) for item in items]

        db.session.add_all(new_items)
        db.session.commit()

        serialized_items = [item.serialize() for item in new_items]

        return jsonify(serialized_items), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(str(e), status_code=500)


@app.route('/prod_order', methods=['POST'])
def add_prod_orders():
    try:
        prod_orders = request.get_json()
        print("Request body: ", prod_orders)

        for row in prod_orders:
            order = db.session.get(Order, row["order_id"])
            product = db.session.get(Product, row["prod_id"])
            if not order or not product:
                abort(404, description="Item not found")

            order.products.append(product)

        db.session.commit()

        return "prod_order filled successfully.", 201

    except Exception as e:
        db.session.rollback()
        raise APIException(str(e), status_code=500)


@app.route('/user_order', methods=['POST'])
def add_user_orders():
    try:
        user_orders = request.get_json()
        print("Request body: ", user_orders)

        for row in user_orders:
            order = db.session.get(Order, row["order_id"])
            user = db.session.get(User, row["user_id"])
            if not order or not user:
                abort(404, description="Item not found")

            order.users.append(user)

        db.session.commit()

        return "user_order filled successfully.", 201

    except Exception as e:
        db.session.rollback()
        raise APIException(str(e), status_code=500)


@app.route('/favorites', methods=['POST'])
def add_favorites():
    try:
        favorites = request.get_json()
        print("Request body: ", favorites)
        new_favorites = [Favorite(**fav) for fav in favorites]

        db.session.add_all(new_favorites)
        db.session.commit()

        serialized_favorites = [fav.serialize() for fav in new_favorites]

        return jsonify(serialized_favorites), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(str(e), status_code=500)

""" @app.route('/favs', methods=['POST'])
def add_fav():
    item = request.get_json()

    user = db.session.execute(db.select(User).where(User.id == 2)) """

@app.route('/products', methods=['GET'])
def get_products():
    try:
        products = db.session.execute(db.select(Product)).scalars().all()
        return jsonify([product.serialize() for product in products]), 200
    except Exception as e:
        raise APIException(str(e), status_code=500)

@app.route('/products/<int:id>', methods=['GET'])
def get_product_by_id(id):
    try:
        # Buscar el producto por su ID (clave primaria)
        product = db.session.get(Product, id)

        # Si no existe, devolver error 404
        if not product:
            abort(404, description=f"Product with id {id} not found")

        # Si existe, devolver el producto serializado
        return jsonify(product.serialize()), 200

    except Exception as e:
        raise APIException(str(e), status_code=500)
    
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Aquí comparamos directamente, aunque se recomienda bcrypt
    if user.password != password:
        return jsonify({"msg": "Incorrect password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 200


@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")
        firstname = data.get("firstname") or data.get("nombre")
        lastname  = data.get("lastname")  or data.get("apellido")

        # 🔒 fuerza rol a COSTUMER (y asegúrate de que existe en BD)
        rol_value = RoleEnum.COSTUMER

        if not all([email, password, firstname, lastname]):
            return jsonify({"msg": "All fields are required"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "User already exists"}), 409

        new_user = User(
            email=email,
            password=password,
            firstname=firstname,
            lastname=lastname,
            rol=rol_value,
            is_active=True
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.serialize()), 201

    except Exception as e:
        # verás el motivo real del 500
        print("Register error:", e, file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": f"Internal Error: {str(e)}"}), 500


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()   # ahora es string
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"msg": "Invalid token identity"}), 422

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify(user.serialize()), 200



# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)

