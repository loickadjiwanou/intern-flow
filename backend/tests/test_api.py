"""
Backend API Tests for InternFlow CRM
Tests cover: Authentication, Search, Interns CRUD, and related endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rbac-admin-panel.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "admin@internflow.com"
TEST_PASSWORD = "admin123"
TEST_INTERN_ID = "69ba71b6fa337c08ad17ed85"  # Jean Dupont

class TestHealthCheck:
    """Basic API health checks"""
    
    def test_api_is_running(self):
        """Test that API responds"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "InternFlow" in data["message"]
        print("✅ API health check passed")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        assert data["user"]["role"] == "Admin"
        print("✅ Login success test passed")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [400, 401, 404]
        print("✅ Login invalid credentials test passed")
    
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL
        })
        assert response.status_code in [400, 401, 500]
        print("✅ Login missing fields test passed")


class TestSearchAPI:
    """Search API endpoint tests - Feature P0-1"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authentication for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_search_for_existing_intern(self):
        """Test search for 'Jean' returns Jean Dupont"""
        response = requests.get(
            f"{BASE_URL}/api/search?q=Jean",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert data["total"] >= 1
        
        # Verify Jean Dupont is in results
        intern_results = [r for r in data["results"] if r["type"] == "intern"]
        jean_found = any("Jean" in r["title"] for r in intern_results)
        assert jean_found, "Jean Dupont should be in search results"
        print("✅ Search for 'Jean' returned expected results")
    
    def test_search_with_short_query(self):
        """Test search with query < 2 chars returns empty"""
        response = requests.get(
            f"{BASE_URL}/api/search?q=J",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["results"] == []
        assert data["total"] == 0
        print("✅ Search with short query returns empty")
    
    def test_search_without_auth(self):
        """Test search without authentication fails"""
        response = requests.get(f"{BASE_URL}/api/search?q=Jean")
        assert response.status_code == 401
        print("✅ Search without auth returns 401")
    
    def test_search_for_department(self):
        """Test search by department"""
        response = requests.get(
            f"{BASE_URL}/api/search?q=IT",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        print(f"✅ Search for 'IT' returned {data['total']} results")


class TestInternDetailAPI:
    """Intern detail endpoint tests - Feature P0-2"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authentication for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_get_intern_by_id(self):
        """Test GET /api/interns/:id returns intern details"""
        response = requests.get(
            f"{BASE_URL}/api/interns/{TEST_INTERN_ID}",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "intern" in data
        intern = data["intern"]
        
        # Validate required fields
        assert intern["firstName"] == "Jean"
        assert intern["lastName"] == "Dupont"
        assert intern["email"] == "jean.dupont@example.com"
        assert intern["status"] == "Active Intern"
        assert intern["department"] == "IT"
        print("✅ Get intern by ID returned correct data")
    
    def test_get_intern_invalid_id(self):
        """Test GET /api/interns/:id with invalid ID"""
        response = requests.get(
            f"{BASE_URL}/api/interns/invalidid123",
            headers=self.headers
        )
        # MongoDB should return 500 for invalid ObjectId format
        assert response.status_code in [400, 404, 500]
        print("✅ Get intern with invalid ID handled correctly")
    
    def test_get_intern_not_found(self):
        """Test GET /api/interns/:id when intern doesn't exist"""
        response = requests.get(
            f"{BASE_URL}/api/interns/000000000000000000000000",
            headers=self.headers
        )
        assert response.status_code == 404
        print("✅ Get non-existent intern returns 404")
    
    def test_get_intern_without_auth(self):
        """Test GET /api/interns/:id without auth fails"""
        response = requests.get(f"{BASE_URL}/api/interns/{TEST_INTERN_ID}")
        assert response.status_code == 401
        print("✅ Get intern without auth returns 401")


class TestInternCRUD:
    """Intern CRUD operations tests - Feature P0-3"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authentication for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
        else:
            pytest.skip("Authentication failed")
        
        # Cleanup list for created interns
        self.created_ids = []
        yield
        # Cleanup created test data
        for intern_id in self.created_ids:
            requests.delete(
                f"{BASE_URL}/api/interns/{intern_id}",
                headers=self.headers
            )
    
    def test_get_all_interns(self):
        """Test GET /api/interns returns list"""
        response = requests.get(
            f"{BASE_URL}/api/interns",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "interns" in data
        assert "total" in data
        assert isinstance(data["interns"], list)
        print(f"✅ Get all interns returned {data['total']} interns")
    
    def test_create_intern(self):
        """Test POST /api/interns creates new intern"""
        new_intern = {
            "firstName": "TEST_CreateNew",
            "lastName": "TestIntern",
            "email": "test.create.new@example.com",
            "status": "Candidate",
            "department": "IT",
            "position": "Junior Developer"
        }
        response = requests.post(
            f"{BASE_URL}/api/interns",
            headers=self.headers,
            json=new_intern
        )
        assert response.status_code == 201
        data = response.json()
        assert "intern" in data
        created = data["intern"]
        self.created_ids.append(created["_id"])
        
        # Validate created data
        assert created["firstName"] == new_intern["firstName"]
        assert created["lastName"] == new_intern["lastName"]
        assert created["email"] == new_intern["email"]
        assert created["status"] == new_intern["status"]
        
        # Verify with GET
        get_response = requests.get(
            f"{BASE_URL}/api/interns/{created['_id']}",
            headers=self.headers
        )
        assert get_response.status_code == 200
        fetched = get_response.json()["intern"]
        assert fetched["firstName"] == new_intern["firstName"]
        print("✅ Create intern and verify persistence passed")
    
    def test_create_intern_missing_required_fields(self):
        """Test POST /api/interns with missing required fields"""
        response = requests.post(
            f"{BASE_URL}/api/interns",
            headers=self.headers,
            json={"firstName": "OnlyFirst"}
        )
        # Should fail due to missing lastName, email
        assert response.status_code in [400, 500]
        print("✅ Create intern with missing fields returns error")
    
    def test_update_intern(self):
        """Test PUT /api/interns/:id updates intern"""
        # First create an intern
        new_intern = {
            "firstName": "TEST_Update",
            "lastName": "Before",
            "email": "test.update@example.com",
            "status": "Candidate"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/interns",
            headers=self.headers,
            json=new_intern
        )
        assert create_response.status_code == 201
        intern_id = create_response.json()["intern"]["_id"]
        self.created_ids.append(intern_id)
        
        # Update the intern
        update_data = {
            "lastName": "After",
            "status": "Interview"
        }
        update_response = requests.put(
            f"{BASE_URL}/api/interns/{intern_id}",
            headers=self.headers,
            json=update_data
        )
        assert update_response.status_code == 200
        updated = update_response.json()["intern"]
        assert updated["lastName"] == "After"
        assert updated["status"] == "Interview"
        
        # Verify with GET
        get_response = requests.get(
            f"{BASE_URL}/api/interns/{intern_id}",
            headers=self.headers
        )
        fetched = get_response.json()["intern"]
        assert fetched["lastName"] == "After"
        print("✅ Update intern and verify persistence passed")
    
    def test_delete_intern(self):
        """Test DELETE /api/interns/:id removes intern"""
        # First create an intern
        new_intern = {
            "firstName": "TEST_Delete",
            "lastName": "ToBeDeleted",
            "email": "test.delete@example.com",
            "status": "Candidate"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/interns",
            headers=self.headers,
            json=new_intern
        )
        assert create_response.status_code == 201
        intern_id = create_response.json()["intern"]["_id"]
        
        # Delete the intern
        delete_response = requests.delete(
            f"{BASE_URL}/api/interns/{intern_id}",
            headers=self.headers
        )
        assert delete_response.status_code == 200
        
        # Verify with GET returns 404
        get_response = requests.get(
            f"{BASE_URL}/api/interns/{intern_id}",
            headers=self.headers
        )
        assert get_response.status_code == 404
        print("✅ Delete intern and verify removal passed")


class TestInternFiltering:
    """Intern list filtering tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authentication for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_filter_by_status(self):
        """Test filtering interns by status"""
        response = requests.get(
            f"{BASE_URL}/api/interns?status=Active%20Intern",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "interns" in data
        # All returned interns should have status "Active Intern"
        for intern in data["interns"]:
            assert intern["status"] == "Active Intern"
        print(f"✅ Filter by status returned {len(data['interns'])} Active Interns")
    
    def test_filter_by_department(self):
        """Test filtering interns by department"""
        response = requests.get(
            f"{BASE_URL}/api/interns?department=IT",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "interns" in data
        # All returned interns should have department "IT"
        for intern in data["interns"]:
            assert intern["department"] == "IT"
        print(f"✅ Filter by department returned {len(data['interns'])} IT interns")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
