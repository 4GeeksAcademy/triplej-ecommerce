from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Enum, DateTime, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import enum


db = SQLAlchemy()

user_order = Table(
    "user_order",
    db.metadata,
    Column("user_id", ForeignKey("user.id")),
    Column("order_id", ForeignKey("order.id")),
)

user_product = Table(
    "user_product",
    db.metadata,
    Column("user_id", ForeignKey("user.id")),
    Column("prod_id", ForeignKey("product.id")),
)

user_fav = Table(
    "user_fav",
    db.metadata,
    Column("user_id", ForeignKey("user.id")),
    Column("fav_id", ForeignKey("favorite.id")),
)

prod_fav = Table(
    "prod_fav",
    db.metadata,
    Column("prod_id", ForeignKey("product.id")),
    Column("fav_id", ForeignKey("favorite.id")),
)

prod_order = Table(
    "prod_order",
    db.metadata,
    Column("prod_id", ForeignKey("product.id")),
    Column("order_id", ForeignKey("order.id")),
)


class RoleEnum(enum.Enum):
    ADMIN = "admin"
    COSTUMER = "costumer"
    ARTIST = "artist"


class User(db.Model):
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    firstname: Mapped[str] = mapped_column(String(120), nullable=False)
    lastname: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), nullable=False)
    rol: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum, name="roleenum"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False)

    orders: Mapped[list['Order']] = relationship(
        secondary="user_order", back_populates="users")
    products: Mapped[list['Product']] = relationship(
        secondary="user_product", back_populates="artist")
    favorites: Mapped[list['Favorite']] = relationship(
        secondary="user_fav", back_populates="users")
    """ items = relationship("OrderItem", back_populates="users") """

    def serialize(self):
        return {
            "id": self.id,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "email": self.email,
            "rol": self.rol.value,
            "is_active": self.is_active,
            "created_at": self.created_at,
        }


class CategoryEnum(enum.Enum):
    HOME_DECORATION = "home_decoration"
    SCULPTURES = "sculptures"


class Product(db.Model):
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    artist_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(Enum(CategoryEnum, name="categoryenum"), nullable=False)
    details: Mapped[str] = mapped_column(String(120), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    discount: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False)

    favorites: Mapped[list["Favorite"]] = relationship(
        secondary="prod_fav", back_populates="products")
    artist: Mapped["User"] = relationship(back_populates="products")
    orders: Mapped[list["Order"]] = relationship(
        secondary="prod_order", back_populates="products")

    def serialize(self):
        return {
            "id": self.id,
            "artist_id": self.artist_id,
            "name": self.name,
            "category": self.category.value,
            "details": self.details,
            "amount": self.amount,
            "price": self.price,
            "discount": self.discount,
            "created_at": self.created_at,
        }


class Favorite(db.Model):
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    prod_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("product.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False)

    users: Mapped[list["User"]] = relationship(
        secondary="user_fav", back_populates="favorites")
    products: Mapped[list["Product"]] = relationship(
        secondary="prod_fav", back_populates="favorites")

    def serialize(self):
        return {
            "id": self.id,
            "prod_id": self.prod_id,
            "user_id": self.user_id,
        }


class Order(db.Model):
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    prod_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("product.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    users: Mapped[list['User']] = relationship(
        secondary="user_order", back_populates="orders")
    products: Mapped[list['Product']] = relationship(
        secondary="prod_order", back_populates="orders")
    """ items: Mapped[list['Order']] = relationship(
        "OrderItem", back_populates="order", cascade="all") """

    def serialize(self):
        return {
            "id": self.id,
            "prod_id": self.prod_id,
            "user_id": self.user_id,
            "quantity": self.quantity
        }


""" class OrderItem(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("order.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("product.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False) 

    order = relationship("Order", back_populates="items", cascade="all")
    product = relationship("Product", back_populates="order_items") """
