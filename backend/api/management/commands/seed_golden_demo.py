import os
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import User, Department, Team, Project, Milestone, Document, Meeting, Review, Viva, Notification

class Command(BaseCommand):
    help = 'Seeds the golden path demo dataset'

    def handle(self, *args, **kwargs):
        self.stdout.write("Wiping existing data...")
        Notification.objects.all().delete()
        Viva.objects.all().delete()
        Review.objects.all().delete()
        Meeting.objects.all().delete()
        Document.objects.all().delete()
        Milestone.objects.all().delete()
        Project.objects.all().delete()
        Team.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        Department.objects.all().delete()

        now = timezone.now()

        # 1. Departments
        self.stdout.write("Creating Departments...")
        cse = Department.objects.create(name="Computer Science and Engineering", code="CSE")
        it = Department.objects.create(name="Information Technology", code="IT")
        ece = Department.objects.create(name="Electronics and Communication Engineering", code="ECE")

        # 2. Users
        self.stdout.write("Creating Users...")
        admin, _ = User.objects.get_or_create(email="admin@university.in", defaults={
            "full_name": "Super Admin",
            "role": "ADMIN",
            "is_active": True,
            "is_verified": True,
            "is_superuser": True,
            "is_staff": True
        })
        admin.set_password("password123")
        admin.save()

        hod_cse = User.objects.create(
            email="hod.cse@university.in",
            full_name="Dr. HOD CSE",
            role="HOD",
            department=cse,
            is_active=True,
            is_verified=True
        )
        hod_cse.set_password("password123")
        hod_cse.save()
        cse.hod = hod_cse
        cse.save()

        guide_cse = User.objects.create(
            email="guide.cse@university.in",
            full_name="Prof. Guide CSE",
            role="GUIDE",
            department=cse,
            is_active=True,
            is_verified=True
        )
        guide_cse.set_password("password123")
        guide_cse.save()

        student_1 = User.objects.create(
            email="student@university.in",
            full_name="Dinesh M",
            roll_number="22CS001",
            role="STUDENT",
            department=cse,
            is_active=True,
            is_verified=True
        )
        student_1.set_password("password123")
        student_1.save()

        student_2 = User.objects.create(
            email="arun@university.in",
            full_name="Arun Kumar",
            roll_number="22CS002",
            role="STUDENT",
            department=cse,
            is_active=True,
            is_verified=True
        )
        student_2.set_password("password123")
        student_2.save()

        student_3 = User.objects.create(
            email="vignesh@university.in",
            full_name="Vignesh Kumar",
            roll_number="22CS003",
            role="STUDENT",
            department=cse,
            is_active=True,
            is_verified=True
        )
        student_3.set_password("password123")
        student_3.save()

        student_4 = User.objects.create(
            email="harish@university.in",
            full_name="Harish Kumar",
            roll_number="22CS004",
            role="STUDENT",
            department=cse,
            is_active=True,
            is_verified=True
        )
        student_4.set_password("password123")
        student_4.save()

        # 3. Team
        self.stdout.write("Creating Team...")
        team = Team.objects.create(
            team_name="Code Crafters",
            team_code="CC2026",
            leader=student_1,
            department=cse,
            academic_year="2026-2027",
            guide=guide_cse,
            status="APPROVED"
        )
        team.members.add(student_1, student_2, student_3, student_4)

        # 4. Project
        self.stdout.write("Creating Project...")
        project = Project.objects.create(
            team=team,
            title="ProjectHub - Final Year Project Management Platform",
            abstract="A comprehensive web application to streamline the process of managing final year engineering projects.\nScope: The system will cover students, guides, HODs, and admins, providing a dedicated portal for each role to manage their specific workflow.",
            problem_statement="Engineering colleges struggle to track final year project proposals, reviews, and document submissions efficiently, leading to disjointed communication and lost files.",
            objectives="1. Centralize project tracking. 2. Enable online proposal submission. 3. Facilitate seamless guide-student communication. 4. Provide real-time analytics for HODs.",
            expected_outcome="A fully functional web portal that reduces administrative overhead by 80% and ensures 100% transparency in project evaluation.",
            domain="Web Development",
            technology="React.js, Django REST Framework, MySQL, Axios, JWT",
            status="APPROVED",
            progress_percentage=35
        )

        # 5. Document
        self.stdout.write("Creating Document...")
        document = Document.objects.create(
            project=project,
            title="Project Proposal",
            document_type="PROPOSAL",
            file="documents/Project_Proposal.pdf",
            uploaded_by=student_1,
            status="APPROVED",
            version="1.0"
        )

        # 6. Review
        self.stdout.write("Creating Review...")
        review = Review.objects.create(
            project=project,
            review_type="PROPOSAL",
            reviewer=guide_cse,
            feedback="Excellent project idea.\nProblem statement is clear.\nObjectives are achievable.\nContinue with Module Development.",
            rating=5,
            status="APPROVED"
        )

        # 7. Meeting
        self.stdout.write("Creating Meeting...")
        meeting = Meeting.objects.create(
            team=team,
            guide=guide_cse,
            title="Initial Project Discussion",
            description="Proposal Review",
            meeting_date=(now + timedelta(days=2)).date(),
            meeting_time="11:00",
            mode="ONLINE",
            venue_or_link="https://meet.google.com/abc-defg-hij",
            status="APPROVED",
            created_by=student_1
        )

        # 8. Milestones
        self.stdout.write("Creating Milestones...")
        Milestone.objects.create(
            project=project,
            title="Requirement Analysis",
            description="Gathering requirements and finalizing tech stack.",
            due_date=(now - timedelta(days=14)).date(),
            status="COMPLETED"
        )
        Milestone.objects.create(
            project=project,
            title="UI Design",
            description="Creating wireframes and high-fidelity mockups.",
            due_date=(now - timedelta(days=7)).date(),
            status="COMPLETED"
        )
        Milestone.objects.create(
            project=project,
            title="Frontend Development",
            description="Building React components and integrating APIs.",
            due_date=(now + timedelta(days=14)).date(),
            status="IN_PROGRESS"
        )
        Milestone.objects.create(
            project=project,
            title="Backend Development",
            description="Creating Django REST Framework APIs.",
            due_date=(now + timedelta(days=30)).date(),
            status="PENDING"
        )

        # 9. Notifications
        self.stdout.write("Creating Notifications...")
        def notify(user, title, message):
            Notification.objects.create(user=user, title=title, message=message, type='SYSTEM')

        notify(student_1, "Project Approved", "Your project proposal 'ProjectHub' has been approved.")
        notify(student_1, "Meeting Approved", "Your meeting 'Initial Project Discussion' was approved.")
        notify(student_1, "Guide Feedback Added", "Prof. Guide CSE added feedback to your proposal.")
        
        notify(guide_cse, "New Proposal Submitted", "Team Code Crafters submitted a new proposal.")
        notify(guide_cse, "Meeting Request", "Team Code Crafters requested a meeting.")
        notify(guide_cse, "Document Uploaded", "Project_Proposal.pdf was uploaded by Code Crafters.")

        notify(hod_cse, "Project Approved", "ProjectHub was approved by Prof. Guide CSE.")
        notify(hod_cse, "Meeting Scheduled", "A meeting is scheduled between Code Crafters and their guide.")

        self.stdout.write(self.style.SUCCESS("Successfully seeded the golden demo data!"))
