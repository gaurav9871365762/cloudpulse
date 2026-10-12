from app import create_app


def test_create_app():
    app = create_app("testing")
    assert app is not None


def test_home_route():
    app = create_app("testing")
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
