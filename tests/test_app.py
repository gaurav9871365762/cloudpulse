from app import create_app


def test_create_app():
    app = create_app("testing")
    assert app is not None


def test_home_route():
    app = create_app("testing")
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200


def test_login_page_route():
    app = create_app("testing")
    client = app.test_client()

    response = client.get("/login")

    assert response.status_code == 200
    assert b"Sign in to CloudPulse" in response.data
    assert client.get("/static/js/login.js").status_code == 200
