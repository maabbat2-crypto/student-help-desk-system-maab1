# Student Help Desk System

A simple student graduation project prototype for managing university support tickets.

## Main Features
- Student registration and login
- Admin login
- Student ticket creation
- Ticket status tracking
- Admin reply and status update
- Simple intelligent ticket classification based on keywords
- Docker support
- GitHub Actions workflows

## Demo Accounts
- Admin: admin@just.edu.jo / admin123
- Student: student@just.edu.jo / student123

## Run Locally
```bash
cd backend
npm install
npm start
```

Open:
```text
http://localhost:5000
```

## Run with Docker
```bash
docker build -t student-help-desk ./backend
docker run -p 5000:5000 student-help-desk
```

## API Examples
Login:
```bash
POST /api/auth/login
{
  "email": "student@just.edu.jo",
  "password": "student123"
}
```

Create ticket:
```bash
POST /api/tickets
Authorization: Bearer TOKEN
{
  "title": "Login problem",
  "description": "I cannot access my university account"
}
```
