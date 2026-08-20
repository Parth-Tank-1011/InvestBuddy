from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from config import Config
from models.db import init_db
from routes.auth import auth_bp
from routes.news import news_bp
from routes.stock import stock_bp
from routes.watchlist import watchlist_bp
from routes.portfolio import portfolio_bp


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    init_db(app.config["DATABASE_PATH"])

    app.register_blueprint(auth_bp)
    app.register_blueprint(stock_bp, url_prefix="/api")
    app.register_blueprint(news_bp, url_prefix="/api")
    app.register_blueprint(watchlist_bp, url_prefix="/api")
    app.register_blueprint(portfolio_bp, url_prefix="/api")

    @app.get("/")
    def health_check():
        return jsonify({"message": "InvestBuddy API is running"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
