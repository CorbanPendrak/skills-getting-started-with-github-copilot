import pytest


@pytest.mark.anyio
async def test_root_redirects_to_static_index(client):
    response = await client.get("/", follow_redirects=False)

    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"