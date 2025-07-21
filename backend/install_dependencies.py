#!/usr/bin/env python3
"""
Installation script for Voice Emotion Detection API dependencies
"""

import subprocess
import sys
import importlib

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package}")
        return False

def check_package(package):
    """Check if a package is installed"""
    try:
        importlib.import_module(package)
        print(f"✅ {package} is already installed")
        return True
    except ImportError:
        print(f"❌ {package} is not installed")
        return False

def main():
    print("🔧 Installing Voice Emotion Detection API dependencies...")
    print("=" * 60)
    
    # List of required packages
    packages = [
        "fastapi",
        "uvicorn",
        "motor",
        "passlib[bcrypt]",
        "python-jose",
        "pydantic[email]",
        "numpy",
        "librosa",
        "soundfile",
        "torch",
        "email-validator"
    ]
    
    # Check and install packages
    failed_packages = []
    
    for package in packages:
        # Extract base package name for checking
        base_package = package.split('[')[0]
        
        if not check_package(base_package):
            if not install_package(package):
                failed_packages.append(package)
    
    print("\n" + "=" * 60)
    
    if failed_packages:
        print(f"❌ Failed to install packages: {', '.join(failed_packages)}")
        print("Please install them manually:")
        for package in failed_packages:
            print(f"  pip install {package}")
        return False
    else:
        print("🎉 All dependencies installed successfully!")
        return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 