from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('GUIDE', 'Guide'),
        ('HOD', 'HOD'),
        ('ADMIN', 'Admin'),
    )

    username = None # Use email for login
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    roll_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT', db_index=True)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    hod = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='hod_department')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    STATUS_CHOICES = (
        ('FORMED', 'Formed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    team_name = models.CharField(max_length=100)
    team_code = models.CharField(max_length=50, unique=True)
    leader = models.ForeignKey(User, on_delete=models.PROTECT, related_name='led_teams')
    members = models.ManyToManyField(User, related_name='teams')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='teams')
    academic_year = models.CharField(max_length=20)
    guide = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='guided_teams', limit_choices_to={'role': 'GUIDE'})
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='FORMED', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.team_name


class Project(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('CHANGES_REQUESTED', 'Changes Requested'),
        ('RESUBMITTED', 'Resubmitted'),
        ('APPROVED', 'Approved'),
        ('MILESTONE_TRACKING', 'Milestone Tracking'),
        ('DOCUMENT_SUBMISSION', 'Document Submission'),
        ('REVIEW_MEETING', 'Review Meeting'),
        ('FINAL_REPORT_SUBMISSION', 'Final Report Submission'),
        ('VIVA_SCHEDULED', 'Viva Scheduled'),
        ('COMPLETED', 'Completed'),
    )
    APPROVAL_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    team = models.OneToOneField(Team, on_delete=models.CASCADE, related_name='project')
    title = models.CharField(max_length=255)
    abstract = models.TextField()
    domain = models.CharField(max_length=100)
    technology = models.CharField(max_length=255, blank=True, null=True)
    objectives = models.TextField(blank=True, null=True)
    problem_statement = models.TextField(blank=True, null=True)
    expected_outcome = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='DRAFT', db_index=True)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='PENDING', db_index=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_projects')
    approved_at = models.DateTimeField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    expected_end_date = models.DateField(null=True, blank=True)
    progress_percentage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Milestone(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('SUBMITTED', 'Submitted'),
        ('GUIDE_APPROVED', 'Guide Approved'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    progress_percentage = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_milestones')
    review_feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project.title} - {self.title}"


class Document(models.Model):
    DOC_TYPES = (
        ('PROPOSAL', 'Proposal'),
        ('SRS', 'SRS'),
        ('DESIGN', 'Design Document'),
        ('PROGRESS', 'Progress Report'),
        ('PRESENTATION', 'Presentation'),
        ('CODE', 'Source Code'),
        ('FINAL', 'Final Report'),
        ('OTHER', 'Other'),
    )
    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_documents')
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DOC_TYPES)
    file = models.FileField(upload_to='project_documents/')
    version = models.CharField(max_length=20, default='1.0')
    remarks = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED', db_index=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_documents')
    review_feedback = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (v{self.version})"


class Meeting(models.Model):
    STATUS_CHOICES = (
        ('REQUESTED', 'Requested'),
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    MODE_CHOICES = (
        ('ONLINE', 'Online'),
        ('OFFLINE', 'Offline'),
    )
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='meetings')
    guide = models.ForeignKey(User, on_delete=models.CASCADE, related_name='guide_meetings')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    meeting_date = models.DateField()
    meeting_time = models.TimeField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='OFFLINE')
    venue_or_link = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED', db_index=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_meetings')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.team.team_name}"


class Review(models.Model):
    REVIEW_TYPES = (
        ('PROPOSAL', 'Proposal Review'),
        ('MILESTONE', 'Milestone Review'),
        ('DOCUMENT', 'Document Review'),
        ('PROGRESS', 'Progress Review'),
        ('FINAL', 'Final Review'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_reviews')
    review_type = models.CharField(max_length=20, choices=REVIEW_TYPES)
    feedback = models.TextField()
    rating = models.IntegerField(default=0) # e.g. 1-5
    status = models.CharField(max_length=20, default='SUBMITTED', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_review_type_display()} for {self.project.title}"

    class Meta:
        unique_together = ('project', 'reviewer', 'review_type')


class Viva(models.Model):
    STATUS_CHOICES = (
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='vivas')
    scheduled_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheduled_vivas')
    viva_date = models.DateField()
    viva_time = models.TimeField()
    venue = models.CharField(max_length=255)
    panel_members = models.TextField(help_text="Comma separated list of panel member names")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Viva for {self.project.title}"


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('TEAM', 'Team Update'),
        ('PROJECT', 'Project Update'),
        ('MILESTONE', 'Milestone Update'),
        ('DOCUMENT', 'Document Update'),
        ('MEETING', 'Meeting Update'),
        ('VIVA', 'Viva Update'),
        ('SYSTEM', 'System Alert'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='SYSTEM')
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} for {self.user.email}"
