#!/usr/bin/env python3

import requests
import json

# Backend API URL
BACKEND_URL = "https://rbac-admin-panel.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

def create_test_users():
    """Create test users for RBAC testing"""
    test_users = [
        {
            "email": "testmanager@internflow.com",
            "password": "test123",
            "firstName": "Test",
            "lastName": "Manager",
            "role": "Manager"
        },
        {
            "email": "testhr@internflow.com",
            "password": "test123",
            "firstName": "Test",
            "lastName": "HR",
            "role": "HR"
        },
        {
            "email": "testintern@internflow.com",
            "password": "test123",
            "firstName": "Test",
            "lastName": "Intern",
            "role": "Intern"
        }
    ]
    
    for user_data in test_users:
        try:
            response = requests.post(f"{API_URL}/auth/register", json=user_data, timeout=10)
            
            if response.status_code == 201:
                print(f"✅ Created user: {user_data['email']} ({user_data['role']})")
            elif response.status_code == 400:
                data = response.json()
                if "already exists" in data.get("message", "").lower():
                    print(f"ℹ️  User already exists: {user_data['email']} ({user_data['role']})")
                else:
                    print(f"❌ Failed to create {user_data['email']}: {data.get('message')}")
            else:
                print(f"❌ Failed to create {user_data['email']}: HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Error creating {user_data['email']}: {str(e)}")

if __name__ == "__main__":
    print("👥 Creating test users for RBAC testing...")
    create_test_users()
    print("✅ Test user setup complete")