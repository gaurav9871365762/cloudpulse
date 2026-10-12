from flask import Flask

from .config import config
from .routes import main_bp


def create_app(config_name=None):
    """Create and configure the Flask application."""
    if config_name is None:
        config_name = "default"

    app = Flask(__name__, template_folder="template")
    app.config.from_object(config[config_name])
    app.register_blueprint(main_bp)
    return app