from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Enum, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import enum


db = SQLAlchemy()


class RoleEnum(enum.Enum):
    ADMIN = "admin"
    COSTUMER = "costumer"
    ARTIST = "artist"


class User(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
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
    
    orders = relationship("Order", back_populates="user")
    products = relationship("Product", back_populates="artist")
    favorites = relationship("Favorite", back_populates="user")
    items = relationship("OrderItem", back_populates="user")

    def serialize(self):
        return {
            "id": self.id,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "email": self.email,
            "rol": self.rol,
            "is_active": self.is_active,
            "created_at": self.created_at,
        }
    
class CategoryEnum(enum.Enum):
    HOME_DECORATION = "home_decoration"
    SCULPTURES = "sculptures"

class Product(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    artist_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(Enum(CategoryEnum), nullable=False)
    details: Mapped[str] = mapped_column(String(120), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    discount: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False)
    
    favorites: Mapped[list["Favorite"]] = relationship(back_populates="products")
    artist: Mapped["User"] = relationship(back_populates="products")
    products: Mapped["Product"] = relationship(back_populates="orders")
    orders: Mapped["Order"] = relationship(back_populates="products")

    def serialize(self):
        return {
            "id": self.id,
            "artist_id": self.artist_id,
            "name": self.name,
            "category": self.category,
            "details": self.details,
            "amount": self.amount,
            "price": self.price,
            "discount": self.discount,
            "created_at": self.created_at,
        }
    
class Favorite(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    prod_id: Mapped[int] = mapped_column(Integer, ForeignKey("product.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    
    users: Mapped["User"] = relationship(back_populates="favorites", cascade="all")
    products: Mapped[list["Product"]] = relationship(back_populates="favorites", cascade="all")

    def serialize(self):
        return {
            "id": self.id,
            "prod_id": self.prod_id,
            "user_id": self.user_id,
        }
    
class Order(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    prod_id: Mapped[int] = mapped_column(Integer, ForeignKey("product.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    
    users = relationship("User", back_populates="users", cascade="all")
    items = relationship("OrderItem", back_populates="order", cascade="all")

    def serialize(self):
        return {
            "id": self.id,
            "prod_id": self.prod_id,
            "user_id": self.user_id,
            "subtotal": self.subtotal
        }

""" class OrderItem(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("order.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("product.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False) 

    order = relationship("Order", back_populates="items", cascade="all")
    product = relationship("Product", back_populates="order_items") """