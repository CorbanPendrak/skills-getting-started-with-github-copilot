import pytest

from src.app import activities


@pytest.mark.anyio
async def test_signup_for_activity_adds_participant(client):
    email = "new.student@mergington.edu"

    response = await client.post("/activities/Chess Club/signup", params={"email": email})

    assert response.status_code == 200
    assert response.json() == {"message": f"Signed up {email} for Chess Club"}
    assert email in activities["Chess Club"]["participants"]


@pytest.mark.anyio
async def test_signup_for_activity_rejects_duplicate_participant(client):
    email = "michael@mergington.edu"

    response = await client.post("/activities/Chess Club/signup", params={"email": email})

    assert response.status_code == 400
    assert response.json() == {"detail": "Student already signed up for this activity"}


@pytest.mark.anyio
async def test_signup_for_missing_activity_returns_404(client):
    response = await client.post("/activities/Robotics Club/signup", params={"email": "new.student@mergington.edu"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Activity not found"}


@pytest.mark.anyio
async def test_unregister_from_activity_removes_participant(client):
    email = "michael@mergington.edu"

    response = await client.delete("/activities/Chess Club/signup", params={"email": email})

    assert response.status_code == 200
    assert response.json() == {"message": f"Unregistered {email} from Chess Club"}
    assert email not in activities["Chess Club"]["participants"]


@pytest.mark.anyio
async def test_unregister_from_activity_rejects_missing_participant(client):
    response = await client.delete("/activities/Chess Club/signup", params={"email": "unknown@mergington.edu"})

    assert response.status_code == 400
    assert response.json() == {"detail": "Student is not signed up for this activity"}


@pytest.mark.anyio
async def test_unregister_from_missing_activity_returns_404(client):
    response = await client.delete("/activities/Robotics Club/signup", params={"email": "unknown@mergington.edu"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Activity not found"}