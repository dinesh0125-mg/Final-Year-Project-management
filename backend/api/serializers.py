from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Department, Team, Project, Milestone, Document, Meeting, Review, Viva, Notification

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone', 'roll_number', 'role', 'department', 'department_name',
                  'profile_image', 'is_active', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'phone', 'roll_number', 'role', 'department']

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            phone=validated_data.get('phone', ''),
            roll_number=validated_data.get('roll_number', ''),
            role=validated_data.get('role', 'STUDENT'),
            department=validated_data.get('department'),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserCreateSerializer(serializers.ModelSerializer):
    """For admin to create users with a default password."""
    password = serializers.CharField(write_only=True, required=False, default='password123')

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone', 'roll_number', 'role', 'department', 'is_active', 'is_verified', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', 'password123')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class DepartmentSerializer(serializers.ModelSerializer):
    hod_name = serializers.CharField(source='hod.full_name', read_only=True, default=None)
    student_count = serializers.SerializerMethodField()
    guide_count = serializers.SerializerMethodField()
    project_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_student_count(self, obj):
        return obj.users.filter(role='STUDENT').count()

    def get_guide_count(self, obj):
        return obj.users.filter(role='GUIDE').count()

    def get_project_count(self, obj):
        return Project.objects.filter(team__department=obj).count()


class TeamListSerializer(serializers.ModelSerializer):
    leader_name = serializers.CharField(source='leader.full_name', read_only=True)
    guide_name = serializers.CharField(source='guide.full_name', read_only=True, default=None)
    department_name = serializers.CharField(source='department.name', read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ['id', 'team_name', 'team_code', 'leader', 'leader_name', 'guide', 'guide_name',
                  'department', 'department_name', 'academic_year', 'status', 'member_count', 'created_at']

    def get_member_count(self, obj):
        return obj.members.count()


class TeamDetailSerializer(serializers.ModelSerializer):
    leader_details = UserSerializer(source='leader', read_only=True)
    guide_details = UserSerializer(source='guide', read_only=True)
    members_details = UserSerializer(source='members', many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Team
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.team_name', read_only=True, default=None)
    guide_name = serializers.CharField(source='team.guide.full_name', read_only=True, default=None)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True, default=None)

    class Meta:
        model = Project
        fields = '__all__'


class MilestoneSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True, default=None)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True, default=None)

    class Meta:
        model = Milestone
        fields = '__all__'
        read_only_fields = ['reviewed_by', 'submitted_at', 'review_feedback', 'progress_percentage']


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True, default=None)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True, default=None)
    project_title = serializers.CharField(source='project.title', read_only=True, default=None)

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'reviewed_by', 'status']


class MeetingSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.team_name', read_only=True, default=None)
    guide_name = serializers.CharField(source='guide.full_name', read_only=True, default=None)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default=None)

    class Meta:
        model = Meeting
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True, default=None)
    project_title = serializers.CharField(source='project.title', read_only=True, default=None)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['reviewer']


class VivaSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True, default=None)
    scheduled_by_name = serializers.CharField(source='scheduled_by.full_name', read_only=True, default=None)

    class Meta:
        model = Viva
        fields = '__all__'
        read_only_fields = ['scheduled_by']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
