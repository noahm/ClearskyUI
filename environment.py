# environment.py

from config_helper import config, logger
import os


default_api_server = "https://api.clearsky.services"


def get_api_var():
    if not os.getenv('CLEAR_SKY'):
        api_environment = config.get("environment", "api")
        if not api_environment:
            logger.warning("Using default environment.")
            api_environment = "prod"
    else:
        if os.getenv('CLEAR_SKY') and config.get("environment", "api"):
            logger.warning("environment override.")
            api_environment = config.get("environment", "api")
        else:
            api_environment = os.environ.get("CLEARSKY_ENVIRONMENT")
            if not api_environment:
                logger.warning("Using default environment.")
                api_environment = "prod"

    return api_environment


config_api_key = config.get("environment", "api_key")
environ_api_key = os.environ.get("CLEARSKY_API_KEY")

if not os.getenv('CLEAR_SKY'):
    api_key = config.get("environment", "api_key")
    api_server_endpoint = config.get("environment", "api_server_endpoint")
else:
    api_key = os.environ.get("CLEARSKY_API_KEY")
    api_server_endpoint = os.environ.get("CLEARSKY_API_SERVER_ENDPOINT")

if not environ_api_key:
    api_key = config_api_key

if not api_key:
    logger.error("No API key configured.")

if not api_server_endpoint:
    logger.error(f"No API server endpoint configured, using default API server: {default_api_server}")
    api_server_endpoint = default_api_server
