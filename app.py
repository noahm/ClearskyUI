# app.py

import sys
from quart import Quart, request, session, jsonify, send_from_directory, redirect
from datetime import datetime, timedelta
import os
import uuid
import asyncio
from quart_rate_limiter import RateLimiter, rate_limit
import config_helper
from config_helper import logger
import functools
from environment import get_api_var, api_key, api_server_endpoint
import aiohttp
import json
# ======================================================================================================================
# ======================================== global variables // Set up logging ==========================================
config = config_helper.read_config()

# Read the package.json file
with open('package.json') as f:
    package_data = json.load(f)

title_name = "ClearSky UI"
os.system("title " + title_name)
version = package_data.get("version")
current_dir = os.getcwd()
log_version = "ClearSky UI Version: " + version
runtime = datetime.now()
current_time = runtime.strftime("%m%d%Y::%H:%M:%S")

try:
    username = os.getlogin()
except OSError:
    username = "Unknown"

app = Quart(__name__, static_folder='static', static_url_path='/static')
rate_limiter = RateLimiter(app)

# Configure session secret key
app.secret_key = 'your-secret-key'

fun_start_time = None
funer_start_time = None
block_stats_app_start_time = None
read_db_connected = None
write_db_connected = None
db_connected = None
blocklist_24_failed = asyncio.Event()
blocklist_failed = asyncio.Event()
db_pool_acquired = asyncio.Event()


# ======================================================================================================================
# ============================================= Main functions =========================================================
def generate_session_number():
    return str(uuid.uuid4().hex)


async def get_ip():  # Get IP address of session request
    if 'X-Forwarded-For' in request.headers:
        # Get the client's IP address from the X-Forwarded-For header
        ip = request.headers.get('X-Forwarded-For')
        # The client's IP address may contain multiple comma-separated values
        # Extract the first IP address from the list
        ip = ip.split(',')[0].strip()
    else:
        # Use the remote address if the X-Forwarded-For header is not available
        ip = request.remote_addr

    return ip


async def get_api_keys(api_environment, key_type, key_value):
    logger.info(f"fetching API key for {api_environment} environment for {key_type} key type.")

    if key_value:
        try:
            fetch_api = f"{api_server_endpoint}/api/v1/auth/base/internal/api-check?api_environment={api_environment}&key_type={key_type}&key_value={key_value}"

            headers = {'X-API-Key': f'{api_key}'}

            async with aiohttp.ClientSession(headers=headers) as session:
                logger.info(f"Fetching data from {api_server_endpoint} API")

                async with session.get(fetch_api) as response:
                    if response.status == 200:
                        data = await response.json()
                    else:
                        logger.error(f"Failed to fetch data from {fetch_api}")
                        data = None
        except Exception as e:
            logger.error(f"An error occurred: {e}")
    else:
        logger.error("no API key configured.")
        data = None
    return data


async def get_time_since(time):
    if time is None:
        return "Not initialized"
    time_difference = datetime.now() - time

    minutes = int((time_difference.total_seconds() / 60))
    hours = minutes // 60
    remaining_minutes = minutes % 60

    if hours > 0 and remaining_minutes > 0:
        if hours == 1:
            elapsed_time = f"{int(hours)} hour {int(remaining_minutes)} minutes ago"
        else:
            elapsed_time = f"{int(hours)} hours {int(remaining_minutes)} minutes ago"
    elif hours > 0:
        if hours == 1:
            elapsed_time = f"{int(hours)} hour ago"
        else:
            elapsed_time = f"{int(hours)} hours ago"
    elif minutes > 0:
        if minutes == 1:
            elapsed_time = f"{int(minutes)} minute ago"
        else:
            elapsed_time = f"{int(minutes)} minutes ago"
    else:
        elapsed_time = "less than a minute ago"

    return elapsed_time


async def get_ip_address():
    if not os.environ.get('CLEAR_SKY'):
        logger.info("IP connection: Using config.ini")
        ip_address = config.get("server", "ip")
        port_address = config.get("server", "port")

        return ip_address, port_address
    else:
        logger.info("IP connection: Using environment variables.")
        ip_address = os.environ.get('CLEAR_SKY_IP')
        port_address = os.environ.get('CLEAR_SKY_PORT')

        return ip_address, port_address


async def run_web_server():
    ip_address, port_address = await get_ip_address()

    if not ip_address or not port_address:
        logger.error("No IP or port configured.")
        sys.exit()

    logger.info(f"Web server starting at: {ip_address}:{port_address}")

    await app.run_task(host=ip_address, port=port_address)


@app.errorhandler(429)
def ratelimit_error(e):
    return jsonify(error="ratelimit exceeded", message=str(e.description)), 429


def api_key_required(key_type):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            api_environment = get_api_var()
            provided_api_key = request.headers.get("X-API-Key")
            api_keys = await get_api_keys(api_environment, key_type, provided_api_key)

            if not api_keys:
                logger.error("API verification failed.")

                return "Unauthorized", 401

            # Check if the provided API key matches the key in the dictionary
            key_value = api_keys.get("api key")
            api_key_status = api_keys.get("api_status")

            if key_value != provided_api_key:
                ip = await get_ip()

                logger.warning(f"<< {ip}: Unauthorized API access.")

                return "Unauthorized", 401  # Return an error response if the API key is not valid
            elif "valid" not in api_key_status:  # Check if the api_status is valid
                return "Unauthorized", 401  # Return an error response if the API status is not valid
            else:
                return await func(*args, **kwargs)

        return wrapper
    return decorator


# ======================================================================================================================
# ================================================== HTML Pages ========================================================
@app.route('/<path:path>', methods=['GET'])
async def index(path):
    session_ip = await get_ip()

    if request.host == 'bsky.thieflord.dev':
        redirect_url = f'https://clearsky.app/{path}'
        logger.info("Redirecting to clearsky.app")

        return redirect(redirect_url, code=301)

    # Generate a new session number and store it in the session
    if 'session_number' not in session:
        session['session_number'] = generate_session_number()

    logger.info(f"<< Incoming request: {session_ip} {session['session_number']} | path: {path}")

    try:
        return await send_from_directory(app.static_folder, path)
    except AssertionError as e:
        range_header = request.headers.get('Range')
        logger.error(f"Byte error: {session_ip} {session['session_number']} | path: {path} | Range: {range_header} Error: {e}")

        return await send_from_directory(app.static_folder, 'index.html')


@app.errorhandler(404)
async def page_not_found(e):
    session_ip = await get_ip()

    # Generate a new session number and store it in the session
    if 'session_number' not in session:
        session['session_number'] = generate_session_number()

    requested_path = request.path

    logger.info(f"<< Incoming request: {session_ip} {session['session_number']} | path: {requested_path}")

    return await send_from_directory(app.static_folder, 'index.html')


@app.route('/status', methods=['GET'])
@rate_limit(10, timedelta(seconds=1))
async def always_200():
    return "OK", 200


@app.route('/statement', methods=['GET'])
async def statement():
    return await send_from_directory(app.static_folder, 'statement.html')


# ======================================================================================================================
# ============================================= API Endpoints ==========================================================
@app.route('/api/v1/base/internal/status/process-status', methods=['GET'])
@api_key_required("UI")
@rate_limit(1, timedelta(seconds=1))
async def get_internal_status():
    api_key = request.headers.get('X-API-Key')
    session_ip = await get_ip()

    # Generate a new session number and store it in the session
    if 'session_number' not in session:
        session['session_number'] = generate_session_number()

    logger.info(f"<< System status requested: {session_ip} - {api_key} - {session['session_number']}")

    now = datetime.now()
    uptime = now - runtime

    status = {
        "clearsky UI version": version,
        "uptime": str(uptime),
        "current time": str(datetime.now()),
    }

    logger.info(f">> System status result returned: {session_ip} - {api_key} - {session['session_number']}")

    return jsonify(status)


@rate_limit(1, timedelta(seconds=1))
@api_key_required("UIPUSH")
@app.route('/api/v1/base/reporting/stats-cache/top-blocked', methods=['POST'])
async def blocked_push_json():
    # Get JSON data from the request
    data = await request.json

    # Write JSON data to a file
    file_path = os.path.join(app.static_folder, 'blocked_data.json')
    with open(file_path, 'w') as file:
        json.dump(data, file)
        file.write('\n')  # Add a newline for clarity if appending multiple JSON objects

    logger.info("Blocked data received")
    logger.info(data)

    return jsonify({'message': 'Data received successfully'}), 200


@rate_limit(1, timedelta(seconds=1))
@api_key_required("UIPUSH")
@app.route('/api/v1/base/reporting/stats-cache/top-24-blocked', methods=['POST'])
async def blocked24_push_json():
    # Get JSON data from the request
    data = await request.json

    # Write JSON data to a file
    file_path = os.path.join(app.static_folder, 'blocked24_data.json')
    with open(file_path, 'w') as file:
        json.dump(data, file)
        file.write('\n')  # Add a newline for clarity if appending multiple JSON objects

    logger.info("Blocked24 data received")
    logger.info(data)

    return jsonify({'message': 'Data received successfully'}), 200


@rate_limit(1, timedelta(seconds=1))
@api_key_required("UIPUSH")
@app.route('/api/v1/base/reporting/stats-cache/block-stats', methods=['POST'])
async def stats_push_json():
    # Get JSON data from the request
    data = await request.json

    # Write JSON data to a file
    file_path = os.path.join(app.static_folder, 'stats_data.json')
    with open(file_path, 'w') as file:
        json.dump(data, file)
        file.write('\n')  # Add a newline for clarity if appending multiple JSON objects

    logger.info("Stats data received")
    logger.info(data)

    return jsonify({'message': 'Data received successfully'}), 200


@rate_limit(1, timedelta(seconds=1))
@api_key_required("UIPUSH")
@app.route('/api/v1/base/reporting/stats-cache/total-users', methods=['POST'])
async def total_users_push_json():
    # Get JSON data from the request
    data = await request.json

    # Write JSON data to a file
    file_path = os.path.join(app.static_folder, 'total_users_data.json')

    with open(file_path, 'w') as file:
        json.dump(data, file)
        file.write('\n')  # Add a newline for clarity if appending multiple JSON objects

    logger.info("total users data received")
    logger.info(data)

    return jsonify({'message': 'Data received successfully'}), 200


@rate_limit(30, timedelta(seconds=1))
@app.route('/api/v1/serve/lists/stats/<path:filename>', methods=['GET'])
async def serve_file(filename):
    try:
        return await send_from_directory(app.static_folder, filename)
    except FileNotFoundError:
        return "error", 404


# ======================================================================================================================
# =============================================== Main Logic ===========================================================
async def main():
    logger.info(log_version)
    logger.debug("Ran from: " + current_dir)
    logger.debug("Ran by: " + username)
    logger.debug("Ran at: " + str(current_time))
    logger.info("File Log level: " + str(config.get("handler_fileHandler", "level")))
    logger.info("Stdout Log level: " + str(config.get("handler_consoleHandler", "level")))

    run_web_server_task = asyncio.create_task(run_web_server())

    await asyncio.gather(run_web_server_task)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
