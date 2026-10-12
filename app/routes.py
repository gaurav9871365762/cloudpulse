from flask import Blueprint, current_app, jsonify, render_template, request

from app.services.sns_alerts import SNSAlertService

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    """Render the dashboard home page."""
    return render_template("index.html")


@main_bp.route("/health")
def health():
    """Simple health check endpoint."""
    return {"status": "ok"}, 200


@main_bp.route("/api")
def api_status():
    """Render a simple API status payload."""
    return jsonify({
        "app": "CloudPulse",
        "message": "Welcome to the CloudPulse API!",
        "version": "1.0",
        "status": "active",
    })


@main_bp.route("/metrics", methods=["GET"])
def get_metrics():
    """Endpoint to retrieve API metrics."""
    return jsonify({
        "message": "Metrics data would be returned here."
    }), 200


@main_bp.route("/login", methods=["POST"])
def login():
    """Handle user login."""
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    if username == "admin" and password == "password":
        return jsonify({"message": "Login successful"}), 200

    return jsonify({"error": "Invalid credentials"}), 401


@main_bp.route("/logout", methods=["POST"])
def logout():
    """Handle user logout."""
    return jsonify({"message": "Logout successful"}), 200


@main_bp.route("/cost-alert", methods=["POST"])
def cost_alert():
    """Endpoint to handle cost alert notifications."""
    data = request.get_json(silent=True) or {}
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    topic_arn = current_app.config.get("SNS_TOPIC_ARN")
    if not topic_arn:
        return jsonify({"error": "SNS topic ARN is not configured."}), 500

    service = SNSAlertService(topic_arn=topic_arn, region_name=current_app.config.get("AWS_REGION", "us-east-1"))
    response = service.send_alert(
        subject=data.get("subject", "CloudPulse Cost Alert"),
        message=data.get("message", "Cost threshold exceeded."),
    )

    return jsonify({
        "message": "Cost alert received",
        "data": data,
        "message_id": response.get("MessageId"),
    }), 200


@main_bp.route("/alerts/test", methods=["POST"])
def test_alert():
    """Send a test notification to the configured SNS topic."""
    payload = request.get_json(silent=True) or {}
    subject = payload.get("subject", "CloudPulse SNS Test")
    message = payload.get("message", "This is a CloudPulse SNS test message.")

    topic_arn = current_app.config.get("SNS_TOPIC_ARN")
    if not topic_arn:
        return jsonify({"error": "SNS topic ARN is not configured."}), 500

    service = SNSAlertService(topic_arn=topic_arn, region_name=current_app.config.get("AWS_REGION", "us-east-1"))
    response = service.send_alert(subject, message)
    return jsonify({
        "status": "sent",
        "message_id": response.get("MessageId"),
        "subject": subject,
        "message": message,
    }), 200