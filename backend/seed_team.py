import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User, Department, Team
from django.contrib.auth.hashers import make_password

# Ensure department exists
dept, created = Department.objects.get_or_create(
    name="Computer Science and Engineering",
    defaults={"code": "CSE"}
)

# Ensure Guide exists
guide, created = User.objects.get_or_create(
    email="guide.cse@university.in",
    defaults={
        "full_name": "CSE Guide",
        "role": "GUIDE",
        "department": dept,
        "password": make_password("password")
    }
)

# Ensure student (leader) exists
leader, created = User.objects.get_or_create(
    email="student@university.in",
    defaults={
        "full_name": "Dinesh M",
        "roll_number": "22CS001",
        "role": "STUDENT",
        "department": dept,
        "password": make_password("password")
    }
)
# Update leader details if already existed
leader.full_name = "Dinesh M"
leader.roll_number = "22CS001"
leader.role = "STUDENT"
leader.department = dept
leader.save()

# Ensure other members exist
members_data = [
    {"email": "arun@university.in", "full_name": "Arun Kumar", "roll_number": "22CS002"},
    {"email": "vignesh@university.in", "full_name": "Vignesh Kumar", "roll_number": "22CS003"},
    {"email": "harish@university.in", "full_name": "Harish Kumar", "roll_number": "22CS004"},
]

members = []
for m_data in members_data:
    user, created = User.objects.get_or_create(
        email=m_data["email"],
        defaults={
            "full_name": m_data["full_name"],
            "roll_number": m_data["roll_number"],
            "role": "STUDENT",
            "department": dept,
            "password": make_password("password")
        }
    )
    user.full_name = m_data["full_name"]
    user.roll_number = m_data["roll_number"]
    user.save()
    members.append(user)

# Clear existing teams for the leader if any
Team.objects.filter(leader=leader).delete()
# And remove leader from any other teams
for t in leader.teams.all():
    t.members.remove(leader)

# Create the team
team = Team.objects.create(
    team_name="Code Crafters",
    team_code="CC2026",
    leader=leader,
    department=dept,
    academic_year="2026-2027",
    guide=guide,
    status="APPROVED"
)

# Add members
team.members.add(leader)
for m in members:
    team.members.add(m)

print("Seeded successfully!")
