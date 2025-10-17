"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory, abort
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, Product, User, Order, Favorite
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from sqlalchemy import text

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

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


"""
    firstname: Mapped[str] = mapped_column(String(120), nullable=False)
    lastname: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), nullable=False)
    rol: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False)
"""

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = db.session.execute(db.select(User)).scalars().all()
        print("all users: ", users)
        if not users: abort(404, description="User not found")
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


@app.route('/products', methods=['GET'])
def get_products():
    try:
        products = db.session.execute(db.select(Product)).scalars().all()
        return jsonify([product.serialize() for product in products]), 200
    except Exception as e:
        raise APIException(str(e), status_code=500)


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
