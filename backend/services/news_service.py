from datetime import datetime, timezone
from pathlib import Path

import yfinance as yf


YFINANCE_CACHE_DIR = Path(__file__).resolve().parents[2] / "database" / "yfinance_cache"
YFINANCE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
yf.set_tz_cache_location(str(YFINANCE_CACHE_DIR))

MARKET_NEWS_SYMBOLS = ["^NSEI", "^BSESN", "TCS.NS", "RELIANCE.NS", "INFY.NS"]
MIN_IMAGE_WIDTH = 320
MIN_IMAGE_HEIGHT = 180
MIN_IMAGE_AREA = MIN_IMAGE_WIDTH * MIN_IMAGE_HEIGHT


def _image_url(value):
    if isinstance(value, str):
        return value

    if isinstance(value, dict):
        return value.get("url")

    return None


def _is_valid_image_url(url):
    if not isinstance(url, str):
        return False

    clean_url = url.strip()
    if not clean_url.startswith(("http://", "https://")):
        return False

    low_quality_markers = ("default.jpg", "logo", "icon", "avatar", "sprite", "1x1")
    return not any(marker in clean_url.lower() for marker in low_quality_markers)


def _image_score(image):
    width = image.get("width") or 0
    height = image.get("height") or 0

    try:
        width = int(width)
        height = int(height)
    except (TypeError, ValueError):
        return 0

    if width < MIN_IMAGE_WIDTH or height < MIN_IMAGE_HEIGHT:
        return 0

    return width * height


def _first_image(content, item, used_images=None, previous_image=None):
    used_images = used_images or set()
    thumbnail = item.get("thumbnail") or content.get("thumbnail") or {}
    resolutions = thumbnail.get("resolutions") or []
    candidates = []

    for image in resolutions:
        url = _image_url(image)
        score = _image_score(image)
        if score and _is_valid_image_url(url):
            candidates.append((score, url))

    for key in ("image", "images"):
        value = content.get(key) or item.get(key)
        if isinstance(value, list):
            for image in value:
                url = _image_url(image)
                score = _image_score(image) if isinstance(image, dict) else MIN_IMAGE_AREA
                if score and _is_valid_image_url(url):
                    candidates.append((score, url))
        else:
            url = _image_url(value)
            if _is_valid_image_url(url):
                candidates.append((MIN_IMAGE_AREA, url))

    for _, url in sorted(candidates, reverse=True):
        if url == previous_image or url in used_images:
            continue
        return url

    return None


def _published_time(content, item):
    published = (
        content.get("pubDate")
        or content.get("displayTime")
        or item.get("pubDate")
        or item.get("displayTime")
    )
    if published:
        return published

    timestamp = item.get("providerPublishTime") or content.get("providerPublishTime")
    if timestamp:
        try:
            return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
        except (OSError, TypeError, ValueError):
            return None

    return None


def _extract_news_item(item, used_images=None, previous_image=None):
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

    if not title or not link:
        return None

    image = _first_image(content, item, used_images, previous_image)

    return {
        "title": title,
        "publisher": publisher or "Market News",
        "link": link,
        "thumbnail": image,
        "image": image,
        "summary": summary or "Read the full market story for more details.",
        "published": _published_time(content, item),
    }


def get_market_news(limit=12):
    articles = []
    seen_links = set()
    used_images = set()
    previous_image = None

    for symbol in MARKET_NEWS_SYMBOLS:
        try:
            ticker = yf.Ticker(symbol)
            news_items = ticker.news or []
        except Exception:
            news_items = []

        for item in news_items:
            article = _extract_news_item(item, used_images, previous_image)
            if not article or article["link"] in seen_links:
                continue

            articles.append(article)
            seen_links.add(article["link"])
            if article.get("image"):
                used_images.add(article["image"])
                previous_image = article["image"]
            else:
                previous_image = None

            if len(articles) >= limit:
                return articles

    return articles
