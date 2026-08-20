from flask import Blueprint, jsonify, request

from models.notes_model import add_note, delete_note, get_all_notes
from models.watchlist_model import add_stock, delete_stock, get_all_stocks

watchlist_bp = Blueprint("watchlist", __name__)


@watchlist_bp.get("/watchlist")
def list_watchlist():
    try:
        return jsonify({"watchlist": get_all_stocks()})
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@watchlist_bp.post("/watchlist")
def create_watchlist_item():
    data = request.get_json() or {}
    symbol = data.get("symbol", "").strip().upper()
    company_name = data.get("company_name", "").strip()

    if not symbol or not company_name:
        return jsonify({"error": "Invalid input"}), 400

    try:
        stock = add_stock(symbol, company_name)
        return jsonify({"message": "Stock added to watchlist", "stock": stock}), 201
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@watchlist_bp.delete("/watchlist/<symbol>")
def remove_watchlist_item(symbol):
    try:
        deleted = delete_stock(symbol.strip().upper())
        if not deleted:
            return jsonify({"message": "Stock not found"}), 404

        return jsonify({"message": "Stock removed from watchlist"})
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@watchlist_bp.get("/notes")
def list_notes():
    try:
        return jsonify({"notes": get_all_notes()})
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@watchlist_bp.post("/notes")
def create_note_item():
    data = request.get_json() or {}
    symbol = data.get("symbol", "").strip().upper()
    note_text = data.get("note_text", "").strip()

    if not symbol or not note_text:
        return jsonify({"error": "Invalid input"}), 400

    try:
        note = add_note(symbol, note_text)
        return jsonify({"message": "Note saved", "note": note}), 201
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@watchlist_bp.delete("/notes/<int:note_id>")
def remove_note_item(note_id):
    try:
        deleted = delete_note(note_id)
        if not deleted:
            return jsonify({"message": "Note not found"}), 404

        return jsonify({"message": "Note deleted"})
    except Exception as error:
        return jsonify({"error": str(error)}), 500
