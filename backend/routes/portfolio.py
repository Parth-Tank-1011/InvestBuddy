from flask import Blueprint, jsonify, request

from services.portfolio_service import generate_portfolio

portfolio_bp = Blueprint("portfolio", __name__)


@portfolio_bp.get("/portfolio")
def portfolio_summary():
    return jsonify({
        "message": "Portfolio endpoint is ready. Add holdings logic here later.",
        "holdings": [],
    })


@portfolio_bp.post("/portfolio")
def create_portfolio():
    data = request.get_json() or {}
    portfolio = generate_portfolio(
        amount=data.get("amount"),
        months=data.get("months"),
        risk=data.get("risk"),
    )

    if portfolio is None:
        return jsonify({"error": "Invalid input"}), 400

    return jsonify({"portfolio": portfolio})
