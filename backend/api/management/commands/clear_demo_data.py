import os
from django.core.management.base import BaseCommand
from api.models import User, Department, Team, Project, Milestone, Document, Meeting, Review, Viva, Notification

class Command(BaseCommand):
    help = 'Clears all demo data (teams, projects, etc.) but keeps core users'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to clear demo data while preserving core accounts...")
        
        # We delete everything except Departments and Users.
        # But wait, deleting Teams will trigger ProtectedError if we try to delete Users.
        # Here we ONLY want to delete the actual projects/teams/etc.
        
        Notification.objects.all().delete()
        Viva.objects.all().delete()
        Review.objects.all().delete()
        Meeting.objects.all().delete()
        Document.objects.all().delete()
        Milestone.objects.all().delete()
        Project.objects.all().delete()
        
        # Because we're just deleting teams, we don't have the ProtectedError 
        # (that happens when deleting users that are referenced by teams).
        Team.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("Successfully cleared all demo projects, teams, and related data."))
        self.stdout.write("Core user accounts and departments have been preserved.")
