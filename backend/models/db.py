import sqlite3
from pathlib import Path


def get_connection(database_path=None):
    if database_path is None:
        from config import Config
        database_path = Config.DATABASE_PATH

    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    return connection


def get_db():
    return get_connection()


def init_db(database_path):
    db_path = Path(database_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    schema_path = db_path.parent / "schema.sql"
    with get_connection(database_path) as connection:
        if schema_path.exists():
            connection.executescript(schema_path.read_text(encoding="utf-8"))
