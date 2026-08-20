from flask import Blueprint, jsonify

from services.yfinance_service import get_stock_data, get_indices_data

stock_bp = Blueprint("stock", __name__)


@stock_bp.get("/stock/<symbol>")
def stock_details(symbol):
    data = get_stock_data(symbol)
    status_code = 404 if data.get("error") else 200
    return jsonify(data), status_code


@stock_bp.get("/stock/<symbol>/prediction")
def stock_prediction(symbol):
    data = get_stock_data(symbol)
    
    if data.get("error"):
        return jsonify({"error": data.get("error")}), 404
    
    history = data.get("history", [])
    
    if len(history) < 7:
        return jsonify({"error": "Insufficient historical data for prediction"}), 400
    
    # Take last 7 days prices
    prices = [
        item.get("price") if isinstance(item, dict) else item
        for item in history[-7:]
    ]
    prices = [price for price in prices if isinstance(price, (int, float))]

    if len(prices) < 7:
        return jsonify({"error": "Insufficient historical data for prediction"}), 400
    
    # Calculate average
    avg = sum(prices) / len(prices)
    
    # Get last price
    last = prices[-1]
    
    # Calculate trend
    trend = last - avg
    
    # Predictions
    day1 = last + trend * 0.3
    day3 = last + trend * 0.6
    day5 = last + trend * 1.0
    
    # Suggestion
    if trend > 0:
        signal = "BUY"
    elif trend < 0:
        signal = "SELL"
    else:
        signal = "HOLD"
    
    # Confidence score
    confidence = abs(trend / avg) * 100
    confidence = min(confidence, 100)
    
    return jsonify({
        "day1": round(day1, 2),
        "day3": round(day3, 2),
        "day5": round(day5, 2),
        "signal": signal,
        "confidence": round(confidence, 2)
    }), 200


@stock_bp.get("/indices")
def indices():
    data = get_indices_data()
    return jsonify(data), 200
