"""
Placeholder - Backend is now running on Node.js
See server.js for the actual implementation
"""
import time
import sys

# Simply sleep forever to prevent supervisor from restarting
# The actual server is running via Node.js (server.js)
if __name__ == "__main__":
    print("Node.js backend is running - this is just a placeholder")
    while True:
        time.sleep(3600)
else:
    # When imported by uvicorn
    from starlette.applications import Starlette
    from starlette.responses import JSONResponse
    from starlette.routing import Route
    
    async def homepage(request):
        return JSONResponse({"message": "Node.js backend running on port 8001"})
    
    app = Starlette(routes=[Route("/", homepage)])
