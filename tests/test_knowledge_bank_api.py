"""
Comprehensive test suite for Knowledge Bank API.
Tests include CRUD operations, filtering, pagination, and error handling.
"""

import pytest
import json
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Assuming the main app structure
# These imports should be adjusted based on your actual project structure
try:
    from app.main import app
    from app.api.endpoints import knowledge_bank
    from app.models.knowledge_bank import KnowledgeBank
    from app.schemas.knowledge_bank import (
        KnowledgeBankCreate,
        KnowledgeBankUpdate,
        KnowledgeBankResponse
    )
    from app.database import get_db
except ImportError:
    # For testing without full app setup
    pass


class TestKnowledgeBankCreate:
    """Test Knowledge Bank creation operations."""

    @pytest.fixture
    def client(self):
        """Provide test client."""
        from fastapi.testclient import TestClient
        return TestClient(app)

    @pytest.fixture
    def sample_knowledge_bank_data(self):
        """Sample knowledge bank data for testing."""
        return {
            "title": "Contract Law Fundamentals",
            "description": "Complete guide to contract law principles",
            "category": "Legal Theory",
            "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "tags": ["contracts", "law", "fundamentals"],
            "author": "Legal Expert",
            "status": "published"
        }

    def test_create_knowledge_bank_success(self, client, sample_knowledge_bank_data):
        """Test successful creation of knowledge bank entry."""
        response = client.post(
            "/api/v1/knowledge-bank",
            json=sample_knowledge_bank_data
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_knowledge_bank_data["title"]
        assert data["description"] == sample_knowledge_bank_data["description"]
        assert data["category"] == sample_knowledge_bank_data["category"]
        assert "id" in data
        assert "created_at" in data

    def test_create_knowledge_bank_missing_required_field(self, client, sample_knowledge_bank_data):
        """Test creation fails with missing required fields."""
        del sample_knowledge_bank_data["title"]
        response = client.post(
            "/api/v1/knowledge-bank",
            json=sample_knowledge_bank_data
        )
        assert response.status_code == 422
        assert "title" in response.json()["detail"][0]["loc"]

    def test_create_knowledge_bank_invalid_category(self, client, sample_knowledge_bank_data):
        """Test creation with invalid category."""
        sample_knowledge_bank_data["category"] = ""
        response = client.post(
            "/api/v1/knowledge-bank",
            json=sample_knowledge_bank_data
        )
        assert response.status_code == 422

    def test_create_knowledge_bank_duplicate_title(self, client, sample_knowledge_bank_data):
        """Test creation fails with duplicate title."""
        # First creation
        response1 = client.post(
            "/api/v1/knowledge-bank",
            json=sample_knowledge_bank_data
        )
        assert response1.status_code == 201

        # Duplicate attempt
        response2 = client.post(
            "/api/v1/knowledge-bank",
            json=sample_knowledge_bank_data
        )
        assert response2.status_code == 409
        assert "already exists" in response2.json()["detail"]

    def test_create_knowledge_bank_with_empty_content(self, client, sample_knowledge_bank_data):
        """Test creation with empty content."""
        sample_knowledge_bank_data["content"] = ""
        response = client.post(
            "/api/v1/knowledge-bank",
            json=sample_knowledge_bank_data
        )
        assert response.status_code == 422

    def test_create_knowledge_bank_with_large_content(self, client, sample_knowledge_bank_data):
        """Test creation with large content."""
        sample_knowledge_bank_data["content"] = "x" * 100000
        response = client.post(
            "/api/v1/knowledge-bank",
            json=sample_knowledge_bank_data
        )
        # Should either succeed or fail with content size validation
        assert response.status_code in [201, 422]

    def test_create_knowledge_bank_with_tags(self, client, sample_knowledge_bank_data):
        """Test creation with multiple tags."""
        sample_knowledge_bank_data["tags"] = ["contract", "law", "agreement", "terms"]
        response = client.post(
            "/api/v1/knowledge-bank",
            json=sample_knowledge_bank_data
        )
        assert response.status_code == 201
        assert len(response.json()["tags"]) == 4


class TestKnowledgeBankRead:
    """Test Knowledge Bank read operations."""

    @pytest.fixture
    def client(self):
        """Provide test client."""
        from fastapi.testclient import TestClient
        return TestClient(app)

    @pytest.fixture
    def created_knowledge_bank(self, client):
        """Create a knowledge bank entry for testing."""
        data = {
            "title": "Test KB Entry",
            "description": "Test description",
            "category": "Legal Theory",
            "content": "Test content",
            "tags": ["test"],
            "author": "Test Author",
            "status": "published"
        }
        response = client.post("/api/v1/knowledge-bank", json=data)
        return response.json()

    def test_read_knowledge_bank_by_id(self, client, created_knowledge_bank):
        """Test retrieving a knowledge bank entry by ID."""
        kb_id = created_knowledge_bank["id"]
        response = client.get(f"/api/v1/knowledge-bank/{kb_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == kb_id
        assert data["title"] == created_knowledge_bank["title"]

    def test_read_knowledge_bank_not_found(self, client):
        """Test retrieving non-existent knowledge bank entry."""
        response = client.get("/api/v1/knowledge-bank/99999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_read_all_knowledge_banks(self, client, created_knowledge_bank):
        """Test retrieving all knowledge bank entries."""
        response = client.get("/api/v1/knowledge-bank")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] > 0
        assert any(item["id"] == created_knowledge_bank["id"] for item in data["items"])

    def test_read_knowledge_bank_invalid_id_format(self, client):
        """Test retrieving with invalid ID format."""
        response = client.get("/api/v1/knowledge-bank/invalid-id")
        assert response.status_code in [400, 404]


class TestKnowledgeBankUpdate:
    """Test Knowledge Bank update operations."""

    @pytest.fixture
    def client(self):
        """Provide test client."""
        from fastapi.testclient import TestClient
        return TestClient(app)

    @pytest.fixture
    def created_knowledge_bank(self, client):
        """Create a knowledge bank entry for testing."""
        data = {
            "title": "Original Title",
            "description": "Original description",
            "category": "Legal Theory",
            "content": "Original content",
            "tags": ["original"],
            "author": "Original Author",
            "status": "published"
        }
        response = client.post("/api/v1/knowledge-bank", json=data)
        return response.json()

    def test_update_knowledge_bank_success(self, client, created_knowledge_bank):
        """Test successful update of knowledge bank entry."""
        kb_id = created_knowledge_bank["id"]
        update_data = {
            "title": "Updated Title",
            "description": "Updated description",
            "content": "Updated content"
        }
        response = client.patch(f"/api/v1/knowledge-bank/{kb_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "Updated description"
        assert data["content"] == "Updated content"

    def test_update_knowledge_bank_partial(self, client, created_knowledge_bank):
        """Test partial update of knowledge bank entry."""
        kb_id = created_knowledge_bank["id"]
        update_data = {"title": "New Title Only"}
        response = client.patch(f"/api/v1/knowledge-bank/{kb_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title Only"
        assert data["description"] == created_knowledge_bank["description"]

    def test_update_knowledge_bank_not_found(self, client):
        """Test update on non-existent entry."""
        response = client.patch(
            "/api/v1/knowledge-bank/99999",
            json={"title": "New Title"}
        )
        assert response.status_code == 404

    def test_update_knowledge_bank_to_duplicate_title(self, client, client_with_two_kbs):
        """Test update to existing title fails."""
        # This requires setup with two different KBs
        # Implementation depends on fixture setup
        pass

    def test_update_knowledge_bank_empty_update(self, client, created_knowledge_bank):
        """Test update with empty data."""
        kb_id = created_knowledge_bank["id"]
        response = client.patch(f"/api/v1/knowledge-bank/{kb_id}", json={})
        assert response.status_code == 200
        # Original data should remain unchanged

    def test_update_knowledge_bank_tags(self, client, created_knowledge_bank):
        """Test updating tags."""
        kb_id = created_knowledge_bank["id"]
        update_data = {"tags": ["new", "tags", "here"]}
        response = client.patch(f"/api/v1/knowledge-bank/{kb_id}", json=update_data)
        assert response.status_code == 200
        assert len(response.json()["tags"]) == 3

    def test_update_knowledge_bank_status(self, client, created_knowledge_bank):
        """Test updating status."""
        kb_id = created_knowledge_bank["id"]
        update_data = {"status": "draft"}
        response = client.patch(f"/api/v1/knowledge-bank/{kb_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["status"] == "draft"


class TestKnowledgeBankDelete:
    """Test Knowledge Bank delete operations."""

    @pytest.fixture
    def client(self):
        """Provide test client."""
        from fastapi.testclient import TestClient
        return TestClient(app)

    @pytest.fixture
    def created_knowledge_bank(self, client):
        """Create a knowledge bank entry for testing."""
        data = {
            "title": "KB to Delete",
            "description": "Will be deleted",
            "category": "Legal Theory",
            "content": "Temporary content",
            "tags": ["delete"],
            "author": "Test Author",
            "status": "published"
        }
        response = client.post("/api/v1/knowledge-bank", json=data)
        return response.json()

    def test_delete_knowledge_bank_success(self, client, created_knowledge_bank):
        """Test successful deletion of knowledge bank entry."""
        kb_id = created_knowledge_bank["id"]
        response = client.delete(f"/api/v1/knowledge-bank/{kb_id}")
        assert response.status_code == 204

        # Verify deletion
        verify_response = client.get(f"/api/v1/knowledge-bank/{kb_id}")
        assert verify_response.status_code == 404

    def test_delete_knowledge_bank_not_found(self, client):
        """Test deletion of non-existent entry."""
        response = client.delete("/api/v1/knowledge-bank/99999")
        assert response.status_code == 404

    def test_delete_knowledge_bank_already_deleted(self, client, created_knowledge_bank):
        """Test deleting already deleted entry."""
        kb_id = created_knowledge_bank["id"]
        response1 = client.delete(f"/api/v1/knowledge-bank/{kb_id}")
        assert response1.status_code == 204

        response2 = client.delete(f"/api/v1/knowledge-bank/{kb_id}")
        assert response2.status_code == 404


class TestKnowledgeBankFiltering:
    """Test Knowledge Bank filtering operations."""

    @pytest.fixture
    def client(self):
        """Provide test client."""
        from fastapi.testclient import TestClient
        return TestClient(app)

    @pytest.fixture
    def multiple_knowledge_banks(self, client):
        """Create multiple knowledge bank entries."""
        entries = [
            {
                "title": "Contract Law",
                "description": "Contract details",
                "category": "Legal Theory",
                "content": "Content about contracts",
                "tags": ["contracts", "law"],
                "author": "Author A",
                "status": "published"
            },
            {
                "title": "Criminal Law",
                "description": "Criminal details",
                "category": "Criminal",
                "content": "Content about criminal law",
                "tags": ["criminal", "law"],
                "author": "Author B",
                "status": "published"
            },
            {
                "title": "Constitutional Rights",
                "description": "Rights details",
                "category": "Constitutional",
                "content": "Content about constitutional rights",
                "tags": ["constitution", "rights"],
                "author": "Author A",
                "status": "draft"
            }
        ]
        created = []
        for entry in entries:
            response = client.post("/api/v1/knowledge-bank", json=entry)
            if response.status_code == 201:
                created.append(response.json())
        return created

    def test_filter_by_category(self, client, multiple_knowledge_banks):
        """Test filtering by category."""
        response = client.get("/api/v1/knowledge-bank?category=Legal Theory")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["category"] == "Legal Theory"

    def test_filter_by_status(self, client, multiple_knowledge_banks):
        """Test filtering by status."""
        response = client.get("/api/v1/knowledge-bank?status=published")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["status"] == "published"

    def test_filter_by_author(self, client, multiple_knowledge_banks):
        """Test filtering by author."""
        response = client.get("/api/v1/knowledge-bank?author=Author A")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["author"] == "Author A"

    def test_filter_by_tag(self, client, multiple_knowledge_banks):
        """Test filtering by tag."""
        response = client.get("/api/v1/knowledge-bank?tag=law")
        assert response.status_code == 200
        data = response.json()
        # All returned items should have the "law" tag
        for item in data["items"]:
            assert "law" in item.get("tags", [])

    def test_filter_by_multiple_parameters(self, client, multiple_knowledge_banks):
        """Test filtering with multiple parameters."""
        response = client.get("/api/v1/knowledge-bank?category=Legal Theory&status=published&author=Author A")
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["category"] == "Legal Theory"
            assert item["status"] == "published"
            assert item["author"] == "Author A"

    def test_filter_by_search_term(self, client, multiple_knowledge_banks):
        """Test filtering by search term."""
        response = client.get("/api/v1/knowledge-bank?search=Contract")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) > 0


class TestKnowledgeBankPagination:
    """Test Knowledge Bank pagination."""

    @pytest.fixture
    def client(self):
        """Provide test client."""
        from fastapi.testclient import TestClient
        return TestClient(app)

    @pytest.fixture
    def many_knowledge_banks(self, client):
        """Create many knowledge bank entries for pagination testing."""
        for i in range(25):
            data = {
                "title": f"KB Entry {i+1}",
                "description": f"Description {i+1}",
                "category": "Legal Theory",
                "content": f"Content for entry {i+1}",
                "tags": ["test"],
                "author": "Test Author",
                "status": "published"
            }
            client.post("/api/v1/knowledge-bank", json=data)

    def test_default_pagination(self, client, many_knowledge_banks):
        """Test default pagination."""
        response = client.get("/api/v1/knowledge-bank")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert len(data["items"]) <= 10  # Default limit

    def test_pagination_with_custom_limit(self, client, many_knowledge_banks):
        """Test pagination with custom limit."""
        response = client.get("/api/v1/knowledge-bank?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 5
        assert data["limit"] == 5

    def test_pagination_with_skip(self, client, many_knowledge_banks):
        """Test pagination with skip."""
        response1 = client.get("/api/v1/knowledge-bank?limit=5&skip=0")
        response2 = client.get("/api/v1/knowledge-bank?limit=5&skip=5")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        items1 = response1.json()["items"]
        items2 = response2.json()["items"]
        
        # Items should be different
        if items1 and items2:
            assert items1[0]["id"] != items2[0]["id"]

    def test_pagination_total_count(self, client, many_knowledge_banks):
        """Test that total count is correct."""
        response = client.get("/api/v1/knowledge-bank")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 25

    def test_pagination_invalid_limit(self, client):
        """Test pagination with invalid limit."""
        response = client.get("/api/v1/knowledge-bank?limit=-1")
        assert response.status_code == 422

    def test_pagination_limit_too_large(self, client):
        """Test pagination with limit exceeding maximum."""
        response = client.get("/api/v1/knowledge-bank?limit=10000")
        # Should either cap at maximum or return validation error
        assert response.status_code in [200, 422]

    def test_pagination_invalid_skip(self, client):
        """Test pagination with invalid skip."""
        response = client.get("/api/v1/knowledge-bank?skip=-1")
        assert response.status_code == 422


class TestKnowledgeBankErrorHandling:
    """Test Knowledge Bank error handling."""

    @pytest.fixture
    def client(self):
        """Provide test client."""
        from fastapi.testclient import TestClient
        return TestClient(app)

    def test_invalid_json_format(self, client):
        """Test request with invalid JSON."""
        response = client.post(
            "/api/v1/knowledge-bank",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422

    def test_method_not_allowed(self, client):
        """Test method not allowed."""
        response = client.put(
            "/api/v1/knowledge-bank",
            json={"title": "Test"}
        )
        assert response.status_code == 405

    def test_unauthorized_access(self, client):
        """Test unauthorized access (if auth is required)."""
        # This depends on your authentication setup
        # response = client.get("/api/v1/knowledge-bank", headers={})
        # assert response.status_code == 401
        pass

    def test_server_error_handling(self, client):
        """Test server error handling."""
        # This would require mocking a database error
        pass

    def test_rate_limiting(self, client):
        """Test rate limiting if implemented."""
        # Make multiple rapid requests
        responses = []
        for _ in range(100):
            response = client.get("/api/v1/knowledge-bank")
            responses.append(response.status_code)
        
        # Should eventually hit rate limit
        # assert 429 in responses or all(r == 200 for r in responses)

    def test_missing_content_type_header(self, client):
        """Test request without content-type header."""
        response = client.post(
            "/api/v1/knowledge-bank",
            data='{"title": "Test"}',
            headers={}
        )
        # Should handle gracefully
        assert response.status_code in [422, 400, 415]

    def test_null_values_in_required_fields(self, client):
        """Test null values in required fields."""
        response = client.post(
            "/api/v1/knowledge-bank",
            json={
                "title": None,
                "description": "Test",
                "category": "Test",
                "content": "Test"
            }
        )
        assert response.status_code == 422

    def test_very_long_field_values(self, client):
        """Test with very long field values."""
        response = client.post(
            "/api/v1/knowledge-bank",
            json={
                "title": "x" * 500,
                "description": "Test",
                "category": "Test",
                "content": "x" * 500000
            }
        )
        # Should either accept or reject with validation error
        assert response.status_code in [201, 422]

    def test_special_characters_in_fields(self, client):
        """Test with special characters."""
        response = client.post(
            "/api/v1/knowledge-bank",
            json={
                "title": "Test <script>alert('xss')</script>",
                "description": "Test & special chars!@#$%",
                "category": "Legal",
                "content": "Content with unicode: 你好世界",
                "tags": ["test"]
            }
        )
        assert response.status_code == 201

    def test_sql_injection_attempt(self, client):
        """Test protection against SQL injection."""
        response = client.post(
            "/api/v1/knowledge-bank",
            json={
                "title": "'; DROP TABLE knowledge_bank; --",
                "description": "Test",
                "category": "Legal",
                "content": "Test"
            }
        )
        # Should safely handle the malicious input
        assert response.status_code == 201


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
