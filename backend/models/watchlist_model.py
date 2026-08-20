from models.db import get_db


def get_all_stocks():
    with get_db() as connection:
        rows = connection.execute(
            "SELECT id, symbol, company_name FROM watchlist ORDER BY symbol"
        ).fetchall()

    return [dict(row) for row in rows]


def add_stock(symbol, company_name):
    with get_db() as connection:
        connection.execute(
            """
            INSERT OR IGNORE INTO watchlist (symbol, company_name)
            VALUES (?, ?)
            """,
            (symbol, company_name),
        )
        row = connection.execute(
            "SELECT id, symbol, company_name FROM watchlist WHERE symbol = ?",
            (symbol,),
        ).fetchone()

    return dict(row)


def delete_stock(symbol):
    with get_db() as connection:
        cursor = connection.execute(
            "DELETE FROM watchlist WHERE symbol = ?",
            (symbol,),
        )

    return cursor.rowcount > 0


def fetch_watchlist_items():
    return get_all_stocks()


def create_watchlist_item(symbol, company_name):
    return add_stock(symbol, company_name)
