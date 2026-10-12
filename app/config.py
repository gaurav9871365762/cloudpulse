import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base application configuration."""

    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    SNS_TOPIC_ARN = os.getenv("SNS_TOPIC_ARN")
    COST_THRESHOLD = int(os.getenv("COST_THRESHOLD", "100"))
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    TESTING = True


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""

    DEBUG = True
    TESTING = True


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}