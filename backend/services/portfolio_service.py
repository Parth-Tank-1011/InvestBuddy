from models.watchlist_model import create_watchlist_item, fetch_watchlist_items
from services.yfinance_service import get_stock_data

STOCK_DATASET = [
    {"symbol": "IDEA.NS", "name": "Vodafone Idea", "price": 8, "risk": "high"},
    {"symbol": "YESBANK.NS", "name": "Yes Bank", "price": 21, "risk": "medium"},
    {"symbol": "SUZLON.NS", "name": "Suzlon Energy", "price": 55, "risk": "medium"},
    {"symbol": "BHEL.NS", "name": "Bharat Heavy Electricals", "price": 120, "risk": "medium"},
    {"symbol": "NMDC.NS", "name": "NMDC", "price": 180, "risk": "low"},
    {"symbol": "COALINDIA.NS", "name": "Coal India", "price": 250, "risk": "low"},
    {"symbol": "POWERGRID.NS", "name": "Power Grid Corp", "price": 320, "risk": "low"},
    {"symbol": "ITC.NS", "name": "ITC", "price": 420, "risk": "low"},
    {"symbol": "HCLTECH.NS", "name": "HCL Technologies", "price": 1500, "risk": "low"},
    {"symbol": "TECHM.NS", "name": "Tech Mahindra", "price": 1400, "risk": "low"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "price": 1050, "risk": "low"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "price": 1700, "risk": "low"},
    {"symbol": "INFY.NS", "name": "Infosys", "price": 1800, "risk": "low"},
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "price": 2800, "risk": "low"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "price": 3500, "risk": "low"},
    {"symbol": "LT.NS", "name": "Larsen & Toubro", "price": 3200, "risk": "low"},
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever", "price": 2600, "risk": "low"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki", "price": 11000, "risk": "low"},
]

RISK_STOCKS = {
    "low": [s for s in STOCK_DATASET if s["risk"] == "low"],
    "medium": [s for s in STOCK_DATASET if s["risk"] in ("low", "medium")],
    "high": [s for s in STOCK_DATASET if s["risk"] in ("low", "medium", "high")],
}


def get_watchlist_stocks():
    return fetch_watchlist_items()


def add_watchlist_stock(symbol, company_name):
    return create_watchlist_item(symbol, company_name)


def _get_current_price(stock, mock_price=None):
    ticker = stock["symbol"]
    current_price = mock_price if mock_price else stock["price"]
    try:
        stock_data = get_stock_data(ticker)
        if stock_data and not stock_data.get("error"):
            fetched = stock_data.get("current_price")
            if fetched and fetched > 0:
                current_price = fetched
    except Exception:
        pass
    return current_price


def generate_portfolio(amount, months, risk):
    if amount is None or months is None or not risk:
        return None

    try:
        amount = float(amount)
        months = int(months)
    except (TypeError, ValueError):
        return None

    risk_key = str(risk).strip().lower()

    if amount <= 0 or months <= 0 or risk_key not in RISK_STOCKS:
        return None

    enhanced_portfolio = []
    total_invested = 0
    remaining_cash = amount
    used_symbols = set()

    risk_filtered = RISK_STOCKS[risk_key]
    affordable_by_risk = sorted(
        [s for s in risk_filtered if s["price"] <= amount],
        key=lambda x: x["price"]
    )

    all_affordable = sorted(
        [s for s in STOCK_DATASET if s["price"] <= amount],
        key=lambda x: x["price"]
    )

    if affordable_by_risk:
        affordable_stocks = affordable_by_risk
    elif all_affordable:
        affordable_stocks = all_affordable
    else:
        affordable_stocks = sorted(STOCK_DATASET, key=lambda x: x["price"])[:5]

    if amount < 100:
        max_per_stock = 0.5
        min_stocks = 2
        max_stocks = 4
    elif amount < 500:
        max_per_stock = 0.4
        min_stocks = 2
        max_stocks = 4
    elif amount < 2000:
        max_per_stock = 0.3
        min_stocks = 3
        max_stocks = 5
    else:
        max_per_stock = 0.25
        min_stocks = 4
        max_stocks = 6

    for stock in affordable_stocks:
        if len(enhanced_portfolio) >= max_stocks:
            break
        if remaining_cash <= 0:
            break

        ticker = stock["symbol"]
        if ticker in used_symbols:
            continue

        current_price = _get_current_price(stock)

        if current_price > remaining_cash:
            continue

        max_allocation = amount * max_per_stock
        max_qty = max(1, int(max_allocation // current_price))
        qty_by_cash = int(remaining_cash // current_price)
        
        if amount < 100:
            quantity = max(1, min(max_qty, qty_by_cash, 2))
        elif amount < 500:
            quantity = max(1, min(max_qty, qty_by_cash, 3))
        else:
            quantity = max(1, min(max_qty, qty_by_cash))

        invested = quantity * current_price

        total_invested += invested
        remaining_cash -= invested
        used_symbols.add(ticker)

        enhanced_portfolio.append({
            "symbol": ticker,
            "name": stock["name"],
            "category": stock["risk"].capitalize(),
            "price": current_price,
            "allocationPercent": round((invested / amount) * 100, 2),
            "allocatedAmount": round(invested, 2),
            "quantity": quantity,
            "invested": round(invested, 2)
        })

    if len(enhanced_portfolio) < min_stocks and remaining_cash > 0:
        for stock in affordable_stocks:
            if len(enhanced_portfolio) >= min_stocks:
                break
            
            ticker = stock["symbol"]
            if ticker in used_symbols:
                continue

            current_price = _get_current_price(stock)
            if current_price > remaining_cash:
                continue

            quantity = max(1, int(remaining_cash // current_price))
            invested = quantity * current_price

            total_invested += invested
            remaining_cash -= invested
            used_symbols.add(ticker)

            enhanced_portfolio.append({
                "symbol": ticker,
                "name": stock["name"],
                "category": stock["risk"].capitalize(),
                "price": current_price,
                "allocationPercent": round((invested / amount) * 100, 2),
                "allocatedAmount": round(invested, 2),
                "quantity": quantity,
                "invested": round(invested, 2)
            })

    cheapest_affordable = sorted(
        [s for s in STOCK_DATASET if s["price"] <= remaining_cash],
        key=lambda x: x["price"]
    )

    while remaining_cash > 0 and cheapest_affordable:
        stock = cheapest_affordable[0]
        ticker = stock["symbol"]
        current_price = _get_current_price(stock)

        if current_price > remaining_cash:
            cheapest_affordable = cheapest_affordable[1:]
            continue

        quantity = int(remaining_cash // current_price)

        if quantity <= 0:
            break

        invested = quantity * current_price
        total_invested += invested
        remaining_cash -= invested
        used_symbols.add(ticker)

        found_idx = None
        for idx, item in enumerate(enhanced_portfolio):
            if item["symbol"] == ticker:
                found_idx = idx
                break

        if found_idx is not None:
            enhanced_portfolio[found_idx]["quantity"] += quantity
            enhanced_portfolio[found_idx]["invested"] = round(
                enhanced_portfolio[found_idx]["invested"] + invested, 2
            )
            enhanced_portfolio[found_idx]["allocationPercent"] = round(
                (enhanced_portfolio[found_idx]["invested"] / amount) * 100, 2
            )
        else:
            enhanced_portfolio.append({
                "symbol": ticker,
                "name": stock["name"],
                "category": stock["risk"].capitalize(),
                "price": current_price,
                "allocationPercent": round((invested / amount) * 100, 2),
                "allocatedAmount": round(invested, 2),
                "quantity": quantity,
                "invested": round(invested, 2)
            })

        cheapest_affordable = sorted(
            [s for s in STOCK_DATASET if s["price"] <= remaining_cash],
            key=lambda x: x["price"]
        )

    return {
        "stocks": enhanced_portfolio,
        "totalInvestment": amount,
        "estimatedInvested": round(total_invested, 2),
        "remainingCash": round(remaining_cash, 2)
    }
