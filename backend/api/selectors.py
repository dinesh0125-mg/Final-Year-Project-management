from .models import Team, Project, Milestone, Document, Meeting

def get_teams_for_user(user):
    """Retrieve teams relevant to the given user based on their role."""
    queryset = Team.objects.select_related('leader', 'guide', 'department').all()
    if user.role == 'STUDENT':
        return queryset.filter(members=user)
    if user.role == 'GUIDE':
        return queryset.filter(guide=user)
    if user.role == 'HOD' and hasattr(user, 'department') and user.department:
        return queryset.filter(department=user.department)
    return queryset

def get_projects_for_user(user):
    """Retrieve projects relevant to the given user based on their role."""
    queryset = Project.objects.select_related('team', 'approved_by').all()
    if user.role == 'STUDENT':
        return queryset.filter(team__members=user)
    if user.role == 'GUIDE':
        return queryset.filter(team__guide=user)
    if user.role == 'HOD' and hasattr(user, 'department') and user.department:
        return queryset.filter(team__department=user.department)
    return queryset
def get_milestones_for_user(user):
    """Retrieve milestones relevant to the given user based on their role."""
    queryset = Milestone.objects.select_related('project', 'reviewed_by').all()
    if user.role == 'STUDENT':
        return queryset.filter(project__team__members=user)
    if user.role == 'GUIDE':
        return queryset.filter(project__team__guide=user)
    if user.role == 'HOD' and hasattr(user, 'department') and user.department:
        return queryset.filter(project__team__department=user.department)
    return queryset

def get_documents_for_user(user):
    queryset = Document.objects.select_related('project', 'uploaded_by', 'reviewed_by').all()
    if user.role == 'STUDENT':
        return queryset.filter(project__team__members=user)
    if user.role == 'GUIDE':
        return queryset.filter(project__team__guide=user)
    if user.role == 'HOD' and hasattr(user, 'department') and user.department:
        return queryset.filter(project__team__department=user.department)
    return queryset

def get_meetings_for_user(user):
    queryset = Meeting.objects.select_related('team', 'guide', 'created_by').all()
    if user.role == 'STUDENT':
        return queryset.filter(team__members=user)
    if user.role == 'GUIDE':
        return queryset.filter(guide=user)
    if user.role == 'HOD' and hasattr(user, 'department') and user.department:
        return queryset.filter(team__department=user.department)
    return queryset

def get_milestones_for_user(user):
    """Retrieve milestones relevant to the given user based on their role."""
    queryset = Milestone.objects.select_related('project', 'reviewed_by').all()
    if user.role == 'STUDENT':
        return queryset.filter(project__team__members=user)
    if user.role == 'GUIDE':
        return queryset.filter(project__team__guide=user)
    if user.role == 'HOD' and hasattr(user, 'department') and user.department:
        return queryset.filter(project__team__department=user.department)
    return queryset
