from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Department, Team, Project

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial dummy data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Create Admin
        if not User.objects.filter(email='admin@projecthub.local').exists():
            User.objects.create_superuser('admin@projecthub.local', 'admin123', full_name='System Admin')
            self.stdout.write('Admin user created')

        # Create HOD
        if not User.objects.filter(email='hod@projecthub.local').exists():
            hod = User.objects.create_user('hod@projecthub.local', 'password123', full_name='Dr. HOD', role='HOD')
            
            # Create Department
            dept, _ = Department.objects.get_or_create(
                code='CSE',
                defaults={'name': 'Computer Science Engineering', 'hod': hod}
            )
            hod.department = dept
            hod.save()
            self.stdout.write('HOD and Department created')

        # Create Guide
        if not User.objects.filter(email='guide@projecthub.local').exists():
            dept = Department.objects.get(code='CSE')
            guide = User.objects.create_user('guide@projecthub.local', 'password123', full_name='Prof. Guide', role='GUIDE', department=dept)
            self.stdout.write('Guide user created')
            
        # Create Student
        if not User.objects.filter(email='student@projecthub.local').exists():
            dept = Department.objects.get(code='CSE')
            student = User.objects.create_user('student@projecthub.local', 'password123', full_name='John Student', role='STUDENT', department=dept)
            self.stdout.write('Student user created')

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
