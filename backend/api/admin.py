from django.contrib import admin
from .models import User, Department, Team, Project, Milestone, Document, Meeting, Review, Viva, Notification

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role', 'department', 'is_active', 'is_verified')
    list_filter = ('role', 'is_active', 'is_verified')
    search_fields = ('email', 'full_name')

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'hod')
    search_fields = ('code', 'name')

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('team_code', 'team_name', 'leader', 'department', 'academic_year', 'guide', 'status')
    list_filter = ('status', 'academic_year')
    search_fields = ('team_code', 'team_name')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'team', 'domain', 'status', 'approval_status', 'progress_percentage')
    list_filter = ('status', 'approval_status')
    search_fields = ('title', 'domain')

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'due_date', 'status', 'progress_percentage')
    list_filter = ('status',)

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'document_type', 'version', 'status', 'uploaded_at')
    list_filter = ('document_type', 'status')

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('title', 'team', 'guide', 'meeting_date', 'mode', 'status')
    list_filter = ('status', 'mode')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('project', 'reviewer', 'review_type', 'rating', 'status')
    list_filter = ('review_type', 'rating', 'status')

@admin.register(Viva)
class VivaAdmin(admin.ModelAdmin):
    list_display = ('project', 'viva_date', 'viva_time', 'venue', 'status')
    list_filter = ('status',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')
