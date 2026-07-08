from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from .views import (
    health_check, register_view, login_view, logout_view, me_view, contact_form,
    request_otp, verify_otp, reset_password,
    UserViewSet, DepartmentViewSet, TeamViewSet, ProjectViewSet,
    MilestoneViewSet, DocumentViewSet, MeetingViewSet, ReviewViewSet,
    VivaViewSet, NotificationViewSet,
    student_dashboard, guide_dashboard, hod_dashboard, admin_dashboard
)
from . import export_views

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'milestones', MilestoneViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'meetings', MeetingViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'viva', VivaViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('contact/', contact_form, name='contact'),

    # Auth APIs
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', me_view, name='me'),
    path('auth/request-otp/', request_otp, name='request_otp'),
    path('auth/verify-otp/', verify_otp, name='verify_otp'),
    path('auth/reset-password/', reset_password, name='reset_password'),

    # Dashboards
    path('dashboard/student/', student_dashboard, name='student_dashboard'),
    path('dashboard/guide/', guide_dashboard, name='guide_dashboard'),
    path('dashboard/hod/', hod_dashboard, name='hod_dashboard'),
    path('dashboard/admin/', admin_dashboard, name='admin_dashboard'),
    
    # Export utilities
    path('export/projects/', export_views.export_projects_csv, name='export-projects'),
    path('export/users/', export_views.export_users_csv, name='export-users'),

    # Swagger Documentation
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Router APIs
    path('', include(router.urls)),
]
