from pathlib import Path

from datetime import datetime, timezone
import math
import yfinance as yf

YFINANCE_CACHE_DIR = Path(__file__).resolve().parents[2] / "database" / "yfinance_cache"
YFINANCE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
yf.set_tz_cache_location(str(YFINANCE_CACHE_DIR))

MIN_NEWS_IMAGE_WIDTH = 320
MIN_NEWS_IMAGE_HEIGHT = 180
MIN_NEWS_IMAGE_AREA = MIN_NEWS_IMAGE_WIDTH * MIN_NEWS_IMAGE_HEIGHT


def _safe_number(value):
    if value is None:
        return None

    try:
        return round(float(value), 2)
    except (TypeError, ValueError):
        return None


def safe_value(val):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    return val


def _calculate_change_percent(current_price, previous_close):
    if current_price is None or previous_close in (None, 0):
        return None

    return _safe_number(((current_price - previous_close) / previous_close) * 100)


def _normalize_indian_symbol(symbol):
    ticker_symbol = symbol.strip().upper()

    if ticker_symbol.endswith((".NS", ".BO")):
        return ticker_symbol

    return f"{ticker_symbol}.NS"


def _bse_fallback_symbol(ticker_symbol):
    if ticker_symbol.endswith(".NS"):
        return ticker_symbol.replace(".NS", ".BO")

    return None


def _get_history_prices(history_frame):
    if history_frame is None or history_frame.empty or "Close" not in history_frame:
        return []

    history = []
    for date, row in history_frame.iterrows():
        price = row.get("Close")
        if price is not None and not (isinstance(price, float) and math.isnan(price)):
            rounded = _safe_number(price)
            if rounded is not None:
                history.append({
                    "date": date.date().isoformat(),
                    "price": rounded,
                })
    return history


def _get_news_items(ticker):
    news_items = []
    used_images = set()
    previous_image = None

    try:
        raw_news = ticker.news or []
    except Exception:
        raw_news = []

    for item in raw_news[:5]:
        content = item.get("content", item)
        title = content.get("title") or item.get("title")
        publisher = content.get("provider", {}).get("displayName") or item.get("publisher")
        link = (
            content.get("canonicalUrl", {}).get("url")
            or content.get("clickThroughUrl", {}).get("url")
            or item.get("link")
        )
        summary = (
            content.get("summary")
            or content.get("description")
            or item.get("summary")
            or item.get("description")
            or publisher
        )
        image = _get_news_image(content, item, used_images, previous_image)

        news_items.append({
            "title": title,
            "publisher": publisher,
            "link": link,
            "thumbnail": image,
            "image": image,
            "summary": summary,
            "published": _get_news_published(content, item),
        })
        if image:
            used_images.add(image)
            previous_image = image
        else:
            previous_image = None

    return news_items


def _news_image_url(value):
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return value.get("url")
    return None


def _is_valid_news_image_url(url):
    if not isinstance(url, str):
        return False

    clean_url = url.strip()
    if not clean_url.startswith(("http://", "https://")):
        return False

    low_quality_markers = ("default.jpg", "logo", "icon", "avatar", "sprite", "1x1")
    return not any(marker in clean_url.lower() for marker in low_quality_markers)


def _news_image_score(image):
    width = image.get("width") or 0
    height = image.get("height") or 0

    try:
        width = int(width)
        height = int(height)
    except (TypeError, ValueError):
        return 0

    if width < MIN_NEWS_IMAGE_WIDTH or height < MIN_NEWS_IMAGE_HEIGHT:
        return 0

    return width * height


def _get_news_image(content, item, used_images=None, previous_image=None):
    used_images = used_images or set()
    thumbnail = item.get("thumbnail") or content.get("thumbnail") or {}
    resolutions = thumbnail.get("resolutions") or []
    candidates = []

    for image in resolutions:
        url = _news_image_url(image)
        score = _news_image_score(image)
        if score and _is_valid_news_image_url(url):
            candidates.append((score, url))

    image = content.get("image") or item.get("image")
    url = _news_image_url(image)
    if _is_valid_news_image_url(url):
        candidates.append((MIN_NEWS_IMAGE_AREA, url))

    for _, url in sorted(candidates, reverse=True):
        if url == previous_image or url in used_images:
            continue
        return url

    return None


def _get_news_published(content, item):
    published = content.get("pubDate") or content.get("displayTime") or item.get("pubDate") or item.get("displayTime")
    if published:
        return published

    timestamp = item.get("providerPublishTime") or content.get("providerPublishTime")
    if timestamp:
        try:
            return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
        except (OSError, TypeError, ValueError):
            return None

    return None


def _get_ceo_name(company_officers):
    if not isinstance(company_officers, list):
        return None

    for officer in company_officers:
        title = (officer.get("title") or "").lower()
        if "chief executive" in title or "ceo" in title:
            return officer.get("name")

    for officer in company_officers:
        title = (officer.get("title") or "").lower()
        if "managing director" in title or "md" == title:
            return officer.get("name")

    return company_officers[0].get("name") if company_officers else None


def _get_founded_year(info):
    founded = safe_value(info.get("founded") or info.get("foundedYear"))
    if founded:
        try:
            return int(founded)
        except (TypeError, ValueError):
            return founded

    start_date = safe_value(info.get("startDate"))
    if isinstance(start_date, (int, float)) and start_date > 0:
        try:
            from datetime import datetime
            return datetime.fromtimestamp(start_date).year
        except (OSError, OverflowError, ValueError):
            pass

    # Regex fallback: scan longBusinessSummary for founding-year patterns
    summary = info.get("longBusinessSummary") or info.get("description") or info.get("summary") or ""
    import re
    patterns = [
        r"founded in\s+(\d{4})",
        r"established in\s+(\d{4})",
        r"incorporated in\s+(\d{4})",
        r"established\s+\w+\s+(\d{4})",
        r"(?:founded|established|incorporated)[\s:]+(\d{4})",
    ]
    for pat in patterns:
        m = re.search(pat, summary, re.IGNORECASE)
        if m:
            try:
                year = int(m.group(1))
                if 1800 <= year <= 2025:
                    return year
            except (TypeError, ValueError):
                pass

    return None


_SECTOR_COMPETITORS = {
    "Information Technology": [
        "TCS", "Infosys", "Wipro", "HCLTech", "Tech Mahindra",
        "Larsen & Toubro Infotech", "Mphasis", "Mindtree",
    ],
    "Banking": [
        "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
        "State Bank of India", "IndusInd Bank",
    ],
    "Financial Services": [
        "HDFC Bank", "ICICI Bank", "Bajaj Finance", "SBI Cards",
        "Kotak Mahindra Bank", "L&T Finance",
    ],
    "Automobiles": [
        "Tata Motors", "Mahindra & Mahindra", "Maruti Suzuki",
        "Bajaj Auto", "Hero MotoCorp", "Eicher Motors",
    ],
    "Pharmaceuticals": [
        "Sun Pharma", "Dr. Reddy's", "Cipla", "Aurobindo Pharma",
        "Divi's Laboratories", "Lupin",
    ],
    "Oil, Gas & Consumable Fuels": [
        "Reliance Industries", "ONGC", "Indian Oil", "BPCL",
        "GAIL India", "NTPC",
    ],
    "Metals & Mining": [
        "Tata Steel", "Steel Authority of India", "JSW Steel",
        "Hindalco Industries", "Vedanta",
    ],
    "FMCG": [
        "Hindustan Unilever", "ITC", "Nestle India", "Britannia",
        "Dabur India", "Godrej Consumer",
    ],
    "Real Estate": [
        "DLF", "Oberoi Realty", "Godrej Properties",
        "Macrotech Developers", "Sobha Limited",
    ],
    "Telecommunications": [
        "Bharti Airtel", "Reliance Jio", "Vodafone Idea",
    ],
}


def _get_competitors(sector):
    if isinstance(sector, str) and sector in _SECTOR_COMPETITORS:
        return _SECTOR_COMPETITORS[sector]
    return []


def _fetch_stock_payload(ticker_symbol):
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.info or {}
    hist = ticker.history(period="1y")

    company_name = info.get("longName")
    current_price = safe_value(info.get("currentPrice"))
    open_price = safe_value(info.get("open"))
    previous_close = safe_value(info.get("previousClose"))
    market_cap = safe_value(info.get("marketCap"))
    volume = safe_value(info.get("volume"))
    sector = info.get("sector")
    company_officers = info.get("companyOfficers") or []

    # PE ratio with forwardPE fallback
    pe_ratio = safe_value(info.get("trailingPE"))
    if pe_ratio is None:
        pe_ratio = safe_value(info.get("forwardPE"))

    # 52-week high/low: try API first, fall back to history
    high_52w = safe_value(info.get("fiftyTwoWeekHigh"))
    low_52w = safe_value(info.get("fiftyTwoWeekLow"))

    history_prices = _get_history_prices(hist)
    if history_prices:
        if high_52w is None:
            high_52w = max(item["price"] for item in history_prices)
        if low_52w is None:
            low_52w = min(item["price"] for item in history_prices)

    if not company_name or current_price is None:
        return None

    return {
        "company_name": company_name,
        "symbol": ticker_symbol,
        "currency": "INR",
        "current_price": current_price,
        "change_percent": _calculate_change_percent(current_price, previous_close),
        "open": open_price,
        "previous_close": previous_close,
        "high_52w": high_52w,
        "low_52w": low_52w,
        "pe_ratio": pe_ratio,
        "market_cap": market_cap,
        "volume": volume,
        "sector": sector,
        "industry": info.get("industry"),
        "long_business_summary": info.get("longBusinessSummary"),
        "ceo": _get_ceo_name(company_officers),
        "headquarters": {
            "city": info.get("city"),
            "state": info.get("state"),
            "country": info.get("country"),
        },
        "founded_year": _get_founded_year(info),
        "competitors": _get_competitors(sector),
        "history": history_prices,
        "news": _get_news_items(ticker),
    }


def get_stock_data(symbol):
    try:
        ticker_symbol = _normalize_indian_symbol(symbol)
        stock_data = _fetch_stock_payload(ticker_symbol)

        if stock_data:
            return stock_data

        fallback_symbol = _bse_fallback_symbol(ticker_symbol)
        if fallback_symbol:
            stock_data = _fetch_stock_payload(fallback_symbol)

        if stock_data:
            return stock_data

        return {"error": "Invalid Indian stock symbol"}
    except Exception:
        return {"error": "Invalid Indian stock symbol"}


def get_stock_details(symbol):
    return get_stock_data(symbol)


# Index symbols for Indian markets
INDICES = [
    {"name": "NIFTY 50", "symbol": "^NSEI"},
    {"name": "SENSEX", "symbol": "^BSESN"},
    {"name": "BANK NIFTY", "symbol": "^NSEBANK"},
]


def get_indices_data():
    """Fetch current data for all major Indian market indices."""
    results = []

    for index in INDICES:
        try:
            ticker = yf.Ticker(index["symbol"])
            hist = ticker.history(period="7d")

            if hist.empty:
                results.append({
                    "name": index["name"],
                    "symbol": index["symbol"],
                    "current_price": None,
                    "change_percent": None,
                })
                continue

            # Get latest close as current price
            current_price = safe_value(hist["Close"].iloc[-1])

            # Get previous close (yesterday or most recent previous trading day)
            previous_close = None
            if len(hist) >= 2:
                previous_close = safe_value(hist["Close"].iloc[-2])

            change_percent = _calculate_change_percent(current_price, previous_close)

            results.append({
                "name": index["name"],
                "symbol": index["symbol"],
                "current_price": current_price,
                "change_percent": change_percent,
            })
        except Exception:
            results.append({
                "name": index["name"],
                "symbol": index["symbol"],
                "current_price": None,
                "change_percent": None,
            })

    return results
