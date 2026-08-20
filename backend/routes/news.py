from flask import Blueprint, jsonify

from services.news_service import get_market_news

news_bp = Blueprint("news", __name__)


@news_bp.get("/news")
def latest_news():
    return jsonify(get_market_news())
