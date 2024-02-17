# app.py

import sys
from quart import Quart, request, session, jsonify, send_from_directory
from datetime import datetime, timedelta
import os
import uuid
import asyncio
from quart_rate_limiter import RateLimiter, rate_limit
import config_helper
from config_helper import logger
# ======================================================================================================================
# ======================================== global variables // Set up logging ==========================================
config = config_helper.read_config()

title_name = "ClearSky UI"
os.system("title " + title_name)
version = "4.0.7d"
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


# ======================================================================================================================
# ================================================== HTML Pages ========================================================
@app.route('/<path:path>', methods=['GET'])
async def index(path):
    session_ip = await get_ip()

    # Generate a new session number and store it in the session
    if 'session_number' not in session:
        session['session_number'] = generate_session_number()

    logger.info(f"<< Incoming request: {session_ip} {session['session_number']} | path: {path}")

    return await send_from_directory(app.static_folder, path)


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


# Route handler for privacy.clearsky.app
@app.route('/', subdomain='privacy.ui.staging', methods=['GET'])
@rate_limit(10, timedelta(seconds=1))
async def privacy_home():
    # Redirect to privacy_policy.html when accessing privacy.clearsky.app
    return await send_from_directory(app.static_folder, 'privacy_policy.html')


# ======================================================================================================================
# ============================================= API Endpoints ==========================================================
@app.route('/api/v1/base/internal/status/process-status', methods=['GET'])
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
