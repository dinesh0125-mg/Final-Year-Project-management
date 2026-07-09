import string
import random
from django.utils import timezone
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q
from django.core.mail import send_mail

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_form(request):
    data = request.data
    first_name = data.get('firstName', '')
    last_name = data.get('lastName', '')
    email = data.get('email', '')
    message = data.get('message', '')

    if not email or not message:
        return Response({"status": "error", "message": "Email and message are required"}, status=status.HTTP_400_BAD_REQUEST)

    subject = f"New Contact Request from {first_name} {last_name}"
    body = f"Name: {first_name} {last_name}\nEmail: {email}\n\nMessage:\n{message}"
    
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=email,
            recipient_list=['support@projecthub.edu'],
            fail_silently=False,
        )
        return Response({"status": "success", "message": "Your message has been sent successfully!"})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from .models import (
    User, Department, Team, Project, Milestone,
    Document, Meeting, Review, Viva, Notification
)
from .serializers import (
    UserSerializer, RegisterSerializer, UserCreateSerializer,
    DepartmentSerializer, TeamListSerializer, TeamDetailSerializer,
    ProjectSerializer, MilestoneSerializer, DocumentSerializer,
    MeetingSerializer, ReviewSerializer, VivaSerializer, NotificationSerializer
)
from .utils import api_response
from .permissions import IsAdmin, IsHOD, IsGuide, IsStudent, IsHODOrAdmin
from . import services
from . import selectors

# ─── Helpers ────────────────────────────────────────────────────────
def _notify(user, title, message, notif_type='SYSTEM'):
    services.create_notification(user, title, message, notif_type)


# ─── Health Check ───────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    try:
        from django.db import connection
        connection.ensure_connection()
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return Response({"status": "ok", "database": db_status, "server": "running"})


# ═══════════════════════════════════════════════════════════════════
#  AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return api_response(data=UserSerializer(user).data, message="Registration successful", status_code=status.HTTP_201_CREATED)
    return api_response(errors=serializer.errors, message="Validation Error", success=False, status_code=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    print(f"DEBUG LOGIN ATTEMPT: email='{email}' password='{password}'")
    user = authenticate(username=email, password=password)

    if user:
        if not user.is_active:
            return api_response(message="Account is inactive", success=False, status_code=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }
        return api_response(data=data, message="Login successful")
    return api_response(message="Invalid credentials", success=False, status_code=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return api_response(message="Logout successful")
    except Exception:
        return api_response(message="Logout successful")


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me_view(request):
    if request.method == 'GET':
        return api_response(data=UserSerializer(request.user).data)
    # PATCH — profile update
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return api_response(data=serializer.data, message="Profile updated")
    return api_response(errors=serializer.errors, message="Validation Error", success=False, status_code=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    import uuid
    from django.core.cache import cache
    
    email = request.data.get('email')
    if not email:
        return api_response(message="Email is required", success=False, status_code=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.filter(email=email).first()
    if not user:
        return api_response(message="If an account with this email exists, an OTP has been sent.", success=True)
        
    otp = str(random.randint(100000, 999999))
    cache.set(f'otp_{email}', otp, timeout=600)
    
    # Send email (and print to console for dev)
    print(f"DEBUG OTP for {email}: {otp}")
    try:
        send_mail(
            subject="ProjectHub Password Reset OTP",
            message=f"Your OTP for password reset is: {otp}\nThis code will expire in 10 minutes.",
            from_email=None, # Uses DEFAULT_FROM_EMAIL
            recipient_list=[email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Failed to send email: {e}")
        
    return api_response(message="If an account with this email exists, an OTP has been sent.", success=True)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    import uuid
    from django.core.cache import cache
    
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    if not email or not otp:
        return api_response(message="Email and OTP are required", success=False, status_code=status.HTTP_400_BAD_REQUEST)
        
    cached_otp = cache.get(f'otp_{email}')
    if not cached_otp or cached_otp != otp:
        return api_response(message="Invalid or expired OTP", success=False, status_code=status.HTTP_400_BAD_REQUEST)
        
    # OTP is valid, issue a reset token
    reset_token = str(uuid.uuid4())
    cache.set(f'reset_token_{email}', reset_token, timeout=600)
    
    # Optionally clear the OTP cache so it can't be reused
    cache.delete(f'otp_{email}')
    
    return api_response(data={"reset_token": reset_token}, message="OTP verified successfully", success=True)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    from django.core.cache import cache
    
    email = request.data.get('email')
    token = request.data.get('reset_token')
    new_password = request.data.get('new_password')
    
    if not all([email, token, new_password]):
        return api_response(message="Email, token, and new password are required", success=False, status_code=status.HTTP_400_BAD_REQUEST)
        
    cached_token = cache.get(f'reset_token_{email}')
    if not cached_token or cached_token != token:
        return api_response(message="Invalid or expired reset token", success=False, status_code=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.filter(email=email).first()
    if not user:
        return api_response(message="User not found", success=False, status_code=status.HTTP_404_NOT_FOUND)
        
    user.set_password(new_password)
    user.save()
    
    cache.delete(f'reset_token_{email}')
    
    return api_response(message="Password reset successfully", success=True)


# ═══════════════════════════════════════════════════════════════════
#  STANDARD RESPONSE MIXIN
# ═══════════════════════════════════════════════════════════════════

class StandardResponseMixin:
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            return api_response(data=paginated.data, message="Fetched successfully")
        serializer = self.get_serializer(queryset, many=True)
        return api_response(data=serializer.data, message="Fetched successfully")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(data=serializer.data, message="Fetched successfully")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(data=serializer.data, message="Created successfully", status_code=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(data=serializer.data, message="Updated successfully")

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()
        return api_response(message="Deleted successfully")


# ═══════════════════════════════════════════════════════════════════
#  USER MANAGEMENT (Admin only)
# ═══════════════════════════════════════════════════════════════════

class UserViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = User.objects.select_related('department').all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    search_fields = ['full_name', 'email', 'role']
    filterset_fields = ['role', 'department', 'is_active']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer


# ═══════════════════════════════════════════════════════════════════
#  DEPARTMENTS
# ═══════════════════════════════════════════════════════════════════

class DepartmentViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    search_fields = ['name', 'code']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


# ═══════════════════════════════════════════════════════════════════
#  TEAMS
# ═══════════════════════════════════════════════════════════════════

class TeamViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Team.objects.select_related('leader', 'guide', 'department').all()
    permission_classes = [IsAuthenticated]
    search_fields = ['team_name', 'team_code']
    filterset_fields = ['status', 'department', 'academic_year']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TeamDetailSerializer
        return TeamListSerializer

    def get_queryset(self):
        return selectors.get_teams_for_user(self.request.user)

    @action(detail=False, methods=['post'], url_path='create-team')
    def create_team(self, request):
        team = services.create_team(
            team_name=request.data.get('team_name'),
            leader=request.user,
            academic_year=request.data.get('academic_year', '2024-2025')
        )
        return api_response(data=TeamDetailSerializer(team).data, message="Team created successfully", status_code=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='join')
    def join(self, request):
        code = request.data.get('team_code')
        try:
            team = services.join_team(request.user, code)
            return api_response(data=TeamDetailSerializer(team).data, message="Joined team successfully")
        except Team.DoesNotExist:
            return api_response(message="Invalid team code", success=False, status_code=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return api_response(message=str(e), success=False, status_code=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='my-team')
    def my_team(self, request):
        team = request.user.teams.first()
        if not team:
            team = request.user.led_teams.first()
        if not team:
            return Response({"success": True, "message": "No team found", "data": None}, status=200)
        return api_response(data=TeamDetailSerializer(team).data)

    @action(detail=True, methods=['post'], url_path='allocate-guide')
    def allocate_guide(self, request, pk=None):
        team = self.get_object()
        guide_id = request.data.get('guide_id')
        try:
            guide = User.objects.get(id=guide_id, role='GUIDE')
            team.guide = guide
            team.save()
            _notify(guide, 'New Team Assigned', f'You have been assigned as guide for team "{team.team_name}"', 'TEAM')
            for member in team.members.all():
                _notify(member, 'Guide Allocated', f'{guide.full_name} has been assigned as your guide', 'TEAM')
            return api_response(message="Guide allocated successfully")
        except User.DoesNotExist:
            return api_response(message="Guide not found", success=False, status_code=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='remove-member')
    def remove_member(self, request, pk=None):
        team = self.get_object()
        member_id = request.data.get('member_id')
        try:
            member = User.objects.get(id=member_id)
            team.members.remove(member)
            return api_response(message="Member removed")
        except User.DoesNotExist:
            return api_response(message="User not found", success=False, status_code=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='add-member')
    def add_member(self, request, pk=None):
        team = self.get_object()
        email = request.data.get('email')
        if not email:
            return api_response(message="Email is required", success=False, status_code=status.HTTP_400_BAD_REQUEST)
        try:
            member = User.objects.get(email=email, role='STUDENT')
            if member.teams.exists():
                return api_response(message="Student is already in a team", success=False, status_code=status.HTTP_400_BAD_REQUEST)
            team.members.add(member)
            return api_response(message="Member added successfully")
        except User.DoesNotExist:
            return api_response(message="Student not found with this email", success=False, status_code=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════════════
#  PROJECTS
# ═══════════════════════════════════════════════════════════════════

class ProjectViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Project.objects.select_related('team', 'approved_by').all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['title', 'domain']
    filterset_fields = ['status', 'approval_status']

    def get_queryset(self):
        return selectors.get_projects_for_user(self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        project = self.get_object()
        project = services.submit_project(project)
        return api_response(data=ProjectSerializer(project).data, message="Project submitted successfully")

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        project = self.get_object()
        action_type = request.data.get('action') # APPROVE, REJECT, REQUEST_CHANGES
        feedback = request.data.get('feedback', '')
        project = services.review_project(project, request.user, action_type, feedback)
        return api_response(data=ProjectSerializer(project).data, message=f"Project {action_type.lower()} successfully")


# ═══════════════════════════════════════════════════════════════════
#  MILESTONES
# ═══════════════════════════════════════════════════════════════════

class MilestoneViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Milestone.objects.select_related('project', 'reviewed_by').all()
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'status']

    def get_queryset(self):
        return selectors.get_milestones_for_user(self.request.user)

    def perform_update(self, serializer):
        milestone = serializer.save()
        # Recalculate project progress
        project = milestone.project
        total = project.milestones.count()
        if total > 0:
            completed = project.milestones.filter(status__in=['APPROVED', 'SUBMITTED', 'COMPLETED']).count()
            project.progress_percentage = int((completed / total) * 100)
            project.save()

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        milestone = self.get_object()
        new_status = request.data.get('status')
        review_feedback = request.data.get('review_feedback', '')
        services.review_milestone(milestone, request.user, new_status, review_feedback)
        return api_response(message="Milestone reviewed")


# ═══════════════════════════════════════════════════════════════════
#  DOCUMENTS
# ═══════════════════════════════════════════════════════════════════

class DocumentViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Document.objects.select_related('project', 'uploaded_by', 'reviewed_by').all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'document_type', 'status']

    def get_queryset(self):
        return selectors.get_documents_for_user(self.request.user)

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        doc = self.get_object()
        status = request.data.get('status')
        review_feedback = request.data.get('review_feedback', '')
        services.review_document(doc, request.user, status, review_feedback)
        return api_response(message="Document reviewed")


# ═══════════════════════════════════════════════════════════════════
#  MEETINGS
# ═══════════════════════════════════════════════════════════════════

class MeetingViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Meeting.objects.select_related('team', 'guide', 'created_by').all()
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['team', 'status', 'mode']

    def get_queryset(self):
        return selectors.get_meetings_for_user(self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        meeting = self.get_object()
        services.approve_meeting(meeting)
        return api_response(message="Meeting approved")

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        meeting = self.get_object()
        meeting.status = 'CANCELLED'
        meeting.save()
        return api_response(message="Meeting cancelled")

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        meeting = self.get_object()
        meeting.meeting_date = request.data.get('meeting_date', meeting.meeting_date)
        meeting.meeting_time = request.data.get('meeting_time', meeting.meeting_time)
        meeting.status = 'SCHEDULED'
        meeting.save()
        return api_response(message="Meeting rescheduled")


# ═══════════════════════════════════════════════════════════════════
#  REVIEWS
# ═══════════════════════════════════════════════════════════════════

class ReviewViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Review.objects.select_related('project', 'reviewer').all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'review_type']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return self.queryset.filter(project__team__members=user)
        if user.role == 'GUIDE':
            return self.queryset.filter(Q(reviewer=user) | Q(project__team__guide=user))
        if user.role == 'HOD' and user.department:
            return self.queryset.filter(project__team__department=user.department)
        return self.queryset

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)


# ═══════════════════════════════════════════════════════════════════
#  VIVA
# ═══════════════════════════════════════════════════════════════════

class VivaViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Viva.objects.select_related('project', 'scheduled_by').all()
    serializer_class = VivaSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return self.queryset.filter(project__team__members=user)
        if user.role == 'GUIDE':
            return self.queryset.filter(project__team__guide=user)
        if user.role == 'HOD' and user.department:
            return self.queryset.filter(project__team__department=user.department)
        return self.queryset

    def perform_create(self, serializer):
        viva = serializer.save(scheduled_by=self.request.user)
        for member in viva.project.team.members.all():
            _notify(member, 'Viva Scheduled', f'Viva for "{viva.project.title}" scheduled on {viva.viva_date}', 'VIVA')


# ═══════════════════════════════════════════════════════════════════
#  NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════

class NotificationViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return api_response(message="Marked as read")

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return api_response(message="All notifications marked as read")

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return api_response(data={'count': count})


# ═══════════════════════════════════════════════════════════════════
#  DASHBOARD APIs
# ═══════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    user = request.user
    team = user.teams.select_related('guide', 'department').prefetch_related('members').first()
    project = None
    milestones = []
    upcoming_meetings = []
    viva = None

    if team:
        project = Project.objects.filter(team=team).first()
        if project:
            milestones = list(Milestone.objects.filter(project=project).order_by('due_date').values(
                'id', 'title', 'status', 'due_date', 'progress_percentage'))
            viva = Viva.objects.filter(project=project).order_by('-viva_date').first()
        upcoming_meetings = list(Meeting.objects.filter(
            team=team, status__in=['SCHEDULED', 'REQUESTED']
        ).order_by('meeting_date').values('id', 'title', 'meeting_date', 'meeting_time', 'mode', 'status')[:5])

    pending_docs = Document.objects.filter(
        project__team__members=user, status__in=['SUBMITTED', 'UNDER_REVIEW']).count() if project else 0

    data = {
        'team': TeamDetailSerializer(team).data if team else None,
        'project': ProjectSerializer(project).data if project else None,
        'milestones': milestones,
        'upcoming_meetings': upcoming_meetings,
        'pending_documents': pending_docs,
        'viva': VivaSerializer(viva).data if viva else None,
        'progress_percentage': project.progress_percentage if project else 0,
    }
    return api_response(data=data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def guide_dashboard(request):
    user = request.user
    teams = Team.objects.filter(guide=user).select_related('department').prefetch_related('members')
    team_ids = teams.values_list('id', flat=True)

    data = {
        'total_teams': teams.count(),
        'teams': TeamListSerializer(teams, many=True).data,
        'pending_approvals': Project.objects.filter(team__in=team_ids, approval_status='PENDING').count(),
        'pending_documents': Document.objects.filter(project__team__in=team_ids, status='SUBMITTED').count(),
        'upcoming_meetings': Meeting.objects.filter(guide=user, status='SCHEDULED').count(),
        'total_reviews': Review.objects.filter(reviewer=user).count(),
    }
    return api_response(data=data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hod_dashboard(request):
    dept = request.user.department
    if not dept:
        return api_response(data={})

    data = {
        'total_teams': Team.objects.filter(department=dept).count(),
        'total_students': User.objects.filter(department=dept, role='STUDENT').count(),
        'total_guides': User.objects.filter(department=dept, role='GUIDE').count(),
        'active_projects': Project.objects.filter(team__department=dept, status='IN_PROGRESS').count(),
        'completed_projects': Project.objects.filter(team__department=dept, status='COMPLETED').count(),
        'pending_approvals': Project.objects.filter(team__department=dept, approval_status='PENDING').count(),
        'recent_projects': ProjectSerializer(Project.objects.filter(team__department=dept).select_related('team', 'approved_by', 'team__guide', 'team__leader').order_by('-created_at')[:5], many=True).data,
        'guides': list(User.objects.filter(department=dept, role='GUIDE').values('id', 'full_name', 'email')),
    }
    return api_response(data=data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    data = {
        'total_users': User.objects.count(),
        'total_students': User.objects.filter(role='STUDENT').count(),
        'total_guides': User.objects.filter(role='GUIDE').count(),
        'total_hods': User.objects.filter(role='HOD').count(),
        'total_projects': Project.objects.count(),
        'active_projects': Project.objects.filter(status='IN_PROGRESS').count(),
        'completed_projects': Project.objects.filter(status='COMPLETED').count(),
        'total_departments': Department.objects.count(),
        'total_teams': Team.objects.count(),
        'recent_users': UserSerializer(User.objects.order_by('-created_at')[:5], many=True).data,
    }
    return api_response(data=data)
