#!/usr/bin/env python3
"""
Startup script for the Voice Emotion Detection API
"""

import sys
import os
import uvicorn
from test_imports import test_imports

def main():
    print("🚀 Starting Voice Emotion Detection API...")
    print("=" * 50)
    
    # Test imports first
    if not test_imports():
        print("\n❌ Import test failed. Please check the error messages above.")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✅ All systems ready! Starting server...")
    
    try:
        # Start the server
        uvicorn.run(
            "app:app",
            host="0.0.0.0",
            port=8000,
            log_level="info",
            reload=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 