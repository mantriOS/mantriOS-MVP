from pathlib import Path
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.gemini import load_system_prompt

client = TestClient(app)


def test_prompt_file_loads():
    prompt = load_system_prompt()
    assert "Office of the Hon'ble Minister for Higher Education" in prompt
    assert "summary" in prompt
    assert "department_code" in prompt


@patch("app.api.zapier.db", new_callable=AsyncMock)
@patch("app.api.zapier.analyze_email", new_callable=AsyncMock)
def test_process_email_endpoint(mock_analyze_email, mock_db):
    mock_db.insert_petition.return_value = 1
    mock_db.insert_analysis.return_value = 10
    mock_db.update_petition_status.return_value = None

    mock_analyze_email.return_value = {
        "summary": "Request regarding college scholarship application delay.",
        "department_code": "SCH",
        "priority": "HIGH",
        "confidence": 0.95,
        "reason": "Directly references pending higher education scholarship funds."
    }

    payload = {
        "subject": "Delay in Scholarship Disbursement",
        "body": "Respected Sir, My scholarship has not been credited for 6 months.",
        "headers": {
            "from": "student@example.com",
            "to": "minister.he@kerala.gov.in",
            "date": "Fri, 08 Aug 2026 10:00:00 +0530",
            "message_id": "<12345@mail.gmail.com>"
        }
    }

    response = client.post("/api/v1/zapier/process-email", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["petition_id"] == 1
    assert data["analysis_id"] == 10
    assert data["department_code"] == "SCH"
    assert data["priority"] == "HIGH"
    assert data["confidence"] == 0.95
    mock_analyze_email.assert_called_once()
    mock_db.insert_petition.assert_called_once()
    mock_db.insert_analysis.assert_called_once()

