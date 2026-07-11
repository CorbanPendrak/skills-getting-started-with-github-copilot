import pytest


@pytest.mark.anyio
async def test_get_activities_returns_activity_catalog(client):
    response = await client.get("/activities")

    assert response.status_code == 200
    body = response.json()
    assert "Chess Club" in body
    assert body["Chess Club"]["schedule"] == "Fridays, 3:30 PM - 5:00 PM"