#!/bin/bash

# Script to push NECF Attendance System to GitHub

echo "Starting git setup and push process..."

# Navigate to project directory
cd /Users/user/Desktop/Attendance_System_NECF

# Initialize git repository
echo "Initializing git repository..."
git init

# Add all files
echo "Adding files to git..."
git add .

# Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: NECF Attendance System with role-based access and real-time tracking

Features:
- Role-based access control (Pastor, Cell Leader, Member)
- Real-time attendance tracking with time stamps
- Color-coded attendance status (Present: Green, Absent: Red, Late: Yellow)
- Cell Leader dashboard for individual cell management
- Pastor dashboard for multi-cell oversight
- Attendance marking with multiple modes (manual, QR, bulk)
- Authentication system with JWT
- RESTful API with MongoDB integration
- Responsive React frontend with TypeScript
- Docker containerization support

Cells included:
- Gonyeli Cell (John Doe)
- Merit Cell (Jane Smith)
- Yenikent Cell (Michael Johnson)
- School Cell (Sarah Wilson)
- Küçük Kaymaklı Cell (David Brown)
- Hamitköy Cell (Grace Okonkwo)
- Ortaköy Cell (James Thompson)"

# Set main branch
echo "Setting main branch..."
git branch -M main

# Add remote repository
echo "Adding GitHub remote repository..."
git remote add origin https://github.com/Tkapesa/Necf_Attendance_System.git

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Git setup and push completed!"
echo "Repository should now be available at: https://github.com/Tkapesa/Necf_Attendance_System"

# Show remote status
git remote -v
git status
