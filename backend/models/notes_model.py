from models.db import get_db


def get_all_notes():
    with get_db() as connection:
        rows = connection.execute(
            "SELECT id, symbol, note_text FROM notes ORDER BY id DESC"
        ).fetchall()

    return [dict(row) for row in rows]


def add_note(symbol, note_text):
    with get_db() as connection:
        cursor = connection.execute(
            "INSERT INTO notes (symbol, note_text) VALUES (?, ?)",
            (symbol, note_text),
        )
        note_id = cursor.lastrowid
        row = connection.execute(
            "SELECT id, symbol, note_text FROM notes WHERE id = ?",
            (note_id,),
        ).fetchone()

    return dict(row)


def delete_note(note_id):
    with get_db() as connection:
        cursor = connection.execute(
            "DELETE FROM notes WHERE id = ?",
            (note_id,),
        )

    return cursor.rowcount > 0


def fetch_notes_for_symbol(symbol):
    with get_db() as connection:
        rows = connection.execute(
            "SELECT id, symbol, note_text FROM notes WHERE symbol = ? ORDER BY id DESC",
            (symbol,),
        ).fetchall()

    return [dict(row) for row in rows]


def create_note(symbol, note_text):
    return add_note(symbol, note_text)
