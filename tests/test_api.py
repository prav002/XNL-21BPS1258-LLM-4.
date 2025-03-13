import sys
import os

# ✅ Ensure `backend/` is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

import pytest
from fastapi.testclient import TestClient
from main import app  # ✅ Ensure this matches your backend file structure

client = TestClient(app)

# ✅ Test Token Generation
def test_generate_token():
    response = client.post("/token?username=testuser")
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
