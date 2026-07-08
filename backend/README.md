# ProjectHub Backend Deployment Guide

This repository contains the backend for **ProjectHub**, a Final Year Project Management Platform. It is fully configured for zero-downtime deployment on Render.

## Overview
- **Framework**: Django & Django REST Framework
- **Database**: PostgreSQL (Production on Render) / MySQL (Local Development)
- **File Storage**: Cloudinary (for documents, profile images, projects)
- **Static Files**: WhiteNoise
- **Authentication**: JWT

## Local Development Setup

1. **Clone the repository and enter the backend directory**
   ```bash
   cd projecthub/backend
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   - Copy `.env.example` to `.env`.
   - Update `DATABASE_URL` for your local MySQL database.
   - Example MySQL URL: `mysql://root:password@localhost:3306/projecthub`

5. **Run Migrations & Start Server**
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

6. **Verify Health Check**
   Visit `http://127.0.0.1:8000/api/health/`

---

## Deploying to Render

This backend requires ZERO code changes to deploy to Render. The `render.yaml` handles the infrastructure as code.

### Step-by-Step Deployment
1. Push this code to a GitHub repository.
2. Log in to [Render.com](https://render.com/).
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file and prepare to deploy:
   - A PostgreSQL Database (`projecthub-db`).
   - A Web Service (`projecthub-backend`).
6. **Configure Environment Variables**:
   In the Render dashboard, navigate to your Web Service -> Environment, and add the required variables that cannot be auto-generated (e.g., Cloudinary credentials, Email credentials, Frontend URL).
7. Click **Apply** or let it deploy automatically.

### Automated Render Commands
The following commands are executed automatically by Render on every push:
- **Build**: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
- **Start**: `gunicorn config.wsgi:application`

### Storage Note
Do not store user-uploaded files locally. The local disk on Render is ephemeral. Use the configured Cloudinary integration for all `FileField` and `ImageField` models.
