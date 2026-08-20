from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from models.user_model import create_user, find_user_by_email

auth_bp = Blueprint("auth", __name__)


def public_user(user):
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
    }


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required."}), 400

    print("Saving user:", email)
    password_hash = generate_password_hash(password)
    user = create_user(username, email, password_hash)

    if user is None:
        return jsonify({"error": "An account with this email already exists."}), 409

    return jsonify({"message": "Registration successful.", "user": user}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    print("Checking user:", email)
    user = find_user_by_email(email)

    if user is None or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({"message": "Login successful.", "user": public_user(user)})
