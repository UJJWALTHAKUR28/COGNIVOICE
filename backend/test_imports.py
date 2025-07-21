#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
"""

def test_imports():
    try:
        print("Testing imports...")
        
        # Test core imports
        from core.config import settings
        print("✓ Core config imported")
        
        from core.db.mongo import mongo_client, db, users_collection, audio_clips_collection
        print("✓ Database connections imported")
        
        from core.schemas.user import UserCreate, UserLogin, UserInDB
        print("✓ User schemas imported")
        
        from core.security import hash_password, verify_password, create_access_token, decode_access_token
        print("✓ Security functions imported")
        
        from core.services.user_service import create_user, authenticate_user, get_user_by_email
        print("✓ User services imported")
        
        from core.routes.user import router, get_current_user
        print("✓ User routes imported")
        
        # Test inference import
        from improved_inference import predict_emotion_improved, EMOTIONS
        print("✓ Inference module imported")
        
        # Test main app import
        from app import app
        print("✓ Main app imported")
        
        print("\n🎉 All imports successful! The application should work correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_imports() 