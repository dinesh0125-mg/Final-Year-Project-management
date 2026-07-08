import csv
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Project, User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_projects_csv(request):
    """Export all projects as CSV (Admin/HOD only usually, but allowed for all authenticated here for demo)."""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="projects_export.csv"'

    writer = csv.writer(response)
    writer.writerow(['Project ID', 'Title', 'Domain', 'Status', 'Approval Status', 'Team Name', 'Guide Name'])

    projects = Project.objects.select_related('team', 'team__guide').all()
    for project in projects:
        guide_name = project.team.guide.full_name if project.team.guide else 'No Guide'
        writer.writerow([
            project.id,
            project.title,
            project.domain,
            project.status,
            project.approval_status,
            project.team.team_name,
            guide_name
        ])

    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_users_csv(request):
    """Export users list to CSV."""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="users_export.csv"'

    writer = csv.writer(response)
    writer.writerow(['User ID', 'Full Name', 'Email', 'Role', 'Department'])

    users = User.objects.select_related('department').all()
    for user in users:
        dept_name = user.department.name if user.department else 'N/A'
        writer.writerow([
            user.id,
            user.full_name,
            user.email,
            user.role,
            dept_name
        ])

    return response
