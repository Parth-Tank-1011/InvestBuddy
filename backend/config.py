import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _database_path():
    configured_path = os.getenv("DATABASE_PATH", "database/investbuddy.db")
    if os.path.isabs(configured_path):
        return configured_path

    return os.path.join(BASE_DIR, configured_path)


class Config:
    DATABASE_PATH = _database_path()
