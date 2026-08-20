import sqlite3

from models.db import get_db


def create_user(username, email, password_hash):
    try:
        with get_db() as connection:
            cursor = connection.execute(
                """
                INSERT INTO users (username, email, password)
                VALUES (?, ?, ?)
                """,
                (username, email, password_hash),
            )
            user_id = cursor.lastrowid

        return {"id": user_id, "username": username, "email": email}
    except sqlite3.IntegrityError:
        return None


def find_user_by_email(email):
    with get_db() as connection:
        user = connection.execute(
            """
            SELECT id, username, email, password
            FROM users
            WHERE email = ?
            """,
            (email,),
        ).fetchone()

    if user is None:
        return None

    return dict(user)
