#!/bin/bash
# Render start script
# This file is executed when your service starts on Render

echo "🚀 COGNIVOICE - Starting Production Server"
echo "=========================================="

# Change to backend directory
cd backend

# Run the FastAPI server
python start_server.py
