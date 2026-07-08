import string
import random
from django.utils import timezone
from .models import Team, Project, Notification

def create_notification(user, title, message, notif_type='SYSTEM'):
    """Create a new notification for a user."""
    return Notification.objects.create(user=user, title=title, message=message, type=notif_type)

def create_team(team_name, leader, academic_year='2024-2025'):
    """Create a new team and add the leader as a member."""
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    team = Team.objects.create(
        team_name=team_name,
        team_code=code,
        leader=leader,
        department=leader.department,
        academic_year=academic_year,
    )
    team.members.add(leader)
    create_notification(leader, 'Team Created', f'Your team "{team.team_name}" has been created. Code: {code}', 'TEAM')
    return team

def join_team(user, team_code):
    """Add a user to a team via team code."""
    team = Team.objects.get(team_code=team_code)
    if user in team.members.all():
        raise ValueError("You are already a member of this team")
    team.members.add(user)
    create_notification(user, 'Joined Team', f'You joined team "{team.team_name}"', 'TEAM')
    return team

def submit_project(project):
    """Student submits project proposal."""
    project.status = 'SUBMITTED'
    project.save()
    if project.team.guide:
        create_notification(project.team.guide, 'New Proposal Submitted', f'Team {project.team.team_name} submitted a project proposal: {project.title}.', 'PROJECT')
    return project

def review_project(project, reviewer, action, feedback=''):
    """Guide reviews project proposal."""
    if action == 'APPROVE':
        project.status = 'APPROVED'
        project.approval_status = 'APPROVED'
        project.approved_by = reviewer
        project.approved_at = timezone.now()
        project.start_date = timezone.now().date()
        create_notification(project.team.leader, 'Proposal Approved', f'Your project "{project.title}" has been approved by your guide.', 'PROJECT')
        if project.team.department.hod:
            create_notification(project.team.department.hod, 'Project Approved', f'Project "{project.title}" was approved by guide {reviewer.full_name}.', 'PROJECT')
    elif action == 'REQUEST_CHANGES':
        project.status = 'CHANGES_REQUESTED'
        create_notification(project.team.leader, 'Changes Requested', f'Your guide requested changes on project "{project.title}".', 'PROJECT')
    elif action == 'REJECT':
        project.status = 'DRAFT'
        project.approval_status = 'REJECTED'
        create_notification(project.team.leader, 'Proposal Rejected', f'Your project "{project.title}" was rejected.', 'PROJECT')
    
    project.save()
    return project

def reject_project(project):
    """Reject a project and notify members."""
    project.approval_status = 'REJECTED'
    project.save()
    for member in project.team.members.all():
        create_notification(member, 'Project Rejected', f'Your project "{project.title}" has been rejected.', 'PROJECT')
    return project

def review_milestone(milestone, reviewer, status, review_feedback=''):
    milestone.status = status
    milestone.review_feedback = review_feedback
    milestone.reviewed_by = reviewer
    milestone.save()
    
    project = milestone.project
    total = project.milestones.count()
    if total > 0:
        completed = project.milestones.filter(status__in=['APPROVED', 'COMPLETED']).count()
        project.progress_percentage = int((completed / total) * 100)
        project.save()
        
    create_notification(milestone.project.team.leader, 'Milestone Reviewed',
            f'Milestone "{milestone.title}" has been {status.lower()}.', 'MILESTONE')
    return milestone

def review_document(document, reviewer, status, review_feedback=''):
    document.status = status
    document.review_feedback = review_feedback
    document.reviewed_by = reviewer
    document.save()
    create_notification(document.uploaded_by, 'Document Reviewed',
            f'Your document "{document.title}" has been {status.lower()}.', 'DOCUMENT')
    return document

def approve_meeting(meeting):
    meeting.status = 'SCHEDULED'
    meeting.save()
    create_notification(meeting.created_by, 'Meeting Approved', f'Meeting "{meeting.title}" has been scheduled.', 'MEETING')
    return meeting
