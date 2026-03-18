#!/usr/bin/env python3

import requests
import json
import sys

# Backend API URL
BACKEND_URL = "https://rbac-admin-panel.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

def create_admin_user():
    """Create admin user for testing"""
    admin_data = {
        "email": "admin@internflow.com",
        "password": "admin123",
        "firstName": "System",
        "lastName": "Administrator",
        "role": "Admin"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/register", json=admin_data, timeout=10)
        
        if response.status_code == 201:
            print("✅ Admin user created successfully")
            return True
        elif response.status_code == 400:
            # User might already exist
            data = response.json()
            if "already exists" in data.get("message", "").lower():
                print("ℹ️  Admin user already exists")
                return True
            else:
                print(f"❌ Failed to create admin user: {data.get('message')}")
                return False
        else:
            print(f"❌ Failed to create admin user: HTTP {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        return False

def test_admin_login():
    """Test admin login"""
    login_data = {
        "email": "admin@internflow.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin login successful")
            print(f"   User: {data.get('user', {}).get('firstName')} {data.get('user', {}).get('lastName')}")
            print(f"   Role: {data.get('user', {}).get('role')}")
            return True
        else:
            print(f"❌ Admin login failed: HTTP {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing login: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔧 Setting up admin user for testing...")
    
    # First try to create admin user
    if create_admin_user():
        # Test login
        if test_admin_login():
            print("✅ Admin user setup complete and login working")
            sys.exit(0)
        else:
            print("❌ Admin user exists but login failed")
            sys.exit(1)
    else:
        print("❌ Failed to setup admin user")
        sys.exit(1)