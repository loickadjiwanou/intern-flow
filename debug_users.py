#!/usr/bin/env python3

import requests
import json

# Backend API URL
BACKEND_URL = "https://rbac-admin-panel.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

def debug_users_structure():
    """Debug the structure of user objects returned by the API"""
    
    # Login first
    login_data = {"email": "admin@internflow.com", "password": "admin123"}
    login_response = requests.post(f"{API_URL}/auth/login", json=login_data)
    
    if login_response.status_code != 200:
        print("❌ Login failed")
        return
    
    token = login_response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get users
    users_response = requests.get(f"{API_URL}/users", headers=headers)
    
    if users_response.status_code == 200:
        users_data = users_response.json()
        users = users_data.get("users", [])
        
        print("👥 Users structure debug:")
        print(f"Total users: {len(users)}")
        
        for i, user in enumerate(users):
            print(f"\nUser {i+1}:")
            print(f"  Keys: {list(user.keys())}")
            print(f"  ID field: {user.get('_id')}")
            print(f"  Email: {user.get('email')}")
            print(f"  Role: {user.get('role')}")
            if i >= 2:  # Only show first 3 users
                break
    else:
        print(f"❌ Failed to get users: {users_response.text}")

if __name__ == "__main__":
    debug_users_structure()