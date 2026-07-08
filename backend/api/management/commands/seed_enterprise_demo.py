import os
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Department, Team, Project, Milestone, Document, Meeting, Notification, Viva

class Command(BaseCommand):
    help = 'Seeds the database with realistic enterprise demo data for one academic year'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting enterprise database seeding...")
        
        # Clear existing non-admin data
        User.objects.filter(role__in=['STUDENT', 'GUIDE', 'HOD']).delete()
        Department.objects.all().delete()
        
        # Create Departments
        depts = [
            ("Computer Science and Engineering", "CSE"),
            ("Information Technology", "IT"),
            ("Artificial Intelligence and Data Science", "AIDS"),
            ("Electronics and Communication Engineering", "ECE"),
            ("Electrical and Electronics Engineering", "EEE"),
            ("Mechanical Engineering", "MECH"),
            ("Civil Engineering", "CIVIL")
        ]
        
        dept_objects = {}
        for name, code in depts:
            dept_objects[code] = Department.objects.create(name=name, code=code, description=f"Department of {name}")

        # Create Admin
        if not User.objects.filter(email='admin@demo.com').exists():
            admin = User.objects.create_user(email='admin@demo.com', password='password123', full_name='Super Admin', role='ADMIN', is_verified=True, is_staff=True, is_superuser=True)
        else:
            admin = User.objects.get(email='admin@demo.com')

        # Create HODs
        hods = {}
        for code, dept in dept_objects.items():
            hod = User.objects.create_user(
                email=f'hod.{code.lower()}@demo.com',
                password='password123',
                full_name=f'Dr. {code} Head',
                role='HOD',
                department=dept,
                is_verified=True
            )
            dept.hod = hod
            dept.save()
            hods[code] = hod

        # Create Guides (10+)
        guides = []
        for i in range(15):
            dept_code = random.choice(list(dept_objects.keys()))
            guide = User.objects.create_user(
                email=f'guide{i+1}.{dept_code.lower()}@demo.com',
                password='password123',
                full_name=f'Prof. Guide {i+1}',
                role='GUIDE',
                department=dept_objects[dept_code],
                is_verified=True
            )
            guides.append(guide)

        # Create Students (50+)
        students = []
        for i in range(60):
            dept_code = random.choice(list(dept_objects.keys()))
            student = User.objects.create_user(
                email=f'student{i+1}.{dept_code.lower()}@demo.com',
                password='password123',
                full_name=f'Student {i+1}',
                role='STUDENT',
                department=dept_objects[dept_code],
                is_verified=True
            )
            students.append(student)

        # Create Teams and Projects
        # Group students into teams of 3-4
        random.shuffle(students)
        teams = []
        team_counter = 1
        
        # Ensure we have some projects in different states
        statuses = ['IN_PROGRESS', 'COMPLETED', 'PROPOSED']
        
        while len(students) >= 3:
            team_size = random.randint(3, 4)
            team_members = students[:team_size]
            students = students[team_size:]
            
            leader = team_members[0]
            dept = leader.department
            
            team = Team.objects.create(
                team_name=f'Team Alpha {team_counter}',
                team_code=f'TM{team_counter:04d}',
                leader=leader,
                department=dept,
                academic_year='2025-2026',
                guide=random.choice([g for g in guides if g.department == dept] or guides),
                status='APPROVED'
            )
            for m in team_members:
                team.members.add(m)
                
            project = Project.objects.create(
                team=team,
                title=f'Enterprise Grade Project {team_counter}',
                abstract=f'An innovative solution addressing real world problems in {dept.name}.',
                domain='Enterprise/AI/IoT',
                status=random.choice(statuses),
                approval_status='APPROVED',
                approved_by=hods[dept.code],
                approved_at=timezone.now() - timedelta(days=100),
                start_date=(timezone.now() - timedelta(days=90)).date(),
                progress_percentage=random.randint(20, 100)
            )
            
            # Milestones
            ms1 = Milestone.objects.create(project=project, title='Requirements Gathering', description='SRS doc.', due_date=(timezone.now() - timedelta(days=60)).date(), status='APPROVED')
            ms2 = Milestone.objects.create(project=project, title='System Design', description='Architecture.', due_date=(timezone.now() - timedelta(days=30)).date(), status='APPROVED' if project.progress_percentage > 50 else 'PENDING')
            
            teams.append(team)
            team_counter += 1

        self.stdout.write(self.style.SUCCESS("Successfully seeded enterprise demo data."))
