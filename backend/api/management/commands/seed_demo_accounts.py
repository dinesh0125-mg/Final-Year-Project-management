from django.core.management.base import BaseCommand
from api.models import User, Department

class Command(BaseCommand):
    help = 'Seeds the database with standard demo accounts for all roles'

    def handle(self, *args, **kwargs):
        # Ensure at least one department exists
        department, created = Department.objects.get_or_create(
            name='Computer Science',
            defaults={'code': 'CS'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created default department: Computer Science (CS)'))

        demo_users = [
            {'email': 'student@demo.com', 'full_name': 'Demo Student', 'role': 'STUDENT', 'phone': '9876543210'},
            {'email': 'guide@demo.com', 'full_name': 'Demo Guide', 'role': 'GUIDE', 'phone': '9876543211'},
            {'email': 'hod@demo.com', 'full_name': 'Demo HOD', 'role': 'HOD', 'phone': '9876543212'},
            {'email': 'admin@demo.com', 'full_name': 'Demo Admin', 'role': 'ADMIN', 'phone': '9876543213'},
        ]

        for user_data in demo_users:
            email = user_data['email']
            role = user_data['role']
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    email=email,
                    password='demo123',
                    full_name=user_data['full_name'],
                    phone=user_data['phone'],
                    role=role,
                    department=department if role != 'ADMIN' else None
                )
                user.is_verified = True
                if role == 'ADMIN':
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created {role} account: {email}'))
            else:
                self.stdout.write(self.style.WARNING(f'{role} account {email} already exists'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded all demo accounts!'))
