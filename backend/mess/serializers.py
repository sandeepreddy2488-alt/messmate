from rest_framework import serializers
from .models import Student, Menu, FoodItem, Rating, Feedback, Complaint, Chef, ChefRating, ChefComplaint, MealAttendance

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class MealAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    roll_number = serializers.CharField(source='student.roll_number', read_only=True)

    class Meta:
        model = MealAttendance
        fields = ['id', 'student', 'student_name', 'roll_number', 'date', 'meal_type', 'swipe_time', 'created_at']
        read_only_fields = ['id', 'created_at']

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'menu', 'name', 'category', 'calories', 'protein_g', 'is_chef_special']
        extra_kwargs = {
            'menu': {'required': False}
        }

class MenuSerializer(serializers.ModelSerializer):
    items = FoodItemSerializer(many=True, required=False)
    assigned_chef_name = serializers.CharField(source='assigned_chef.name', read_only=True)

    class Meta:
        model = Menu
        fields = ['id', 'date', 'day_of_week', 'meal_type', 'start_time', 'end_time', 'status', 'is_special', 'special_title', 'assigned_chef', 'assigned_chef_name', 'items']
        validators = []  # Bypass UniqueTogetherValidator to enable atomic upsert in create()

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        date = validated_data.get('date')
        day_of_week = validated_data.get('day_of_week')
        meal_type = validated_data.get('meal_type')

        if date:
            day_of_week = date.strftime('%A')
            validated_data['day_of_week'] = day_of_week
            menu, created = Menu.objects.update_or_create(
                date=date,
                meal_type=meal_type,
                defaults=validated_data
            )
        else:
            menu, created = Menu.objects.update_or_create(
                day_of_week=day_of_week,
                meal_type=meal_type,
                defaults=validated_data
            )

        if items_data:
            menu.items.all().delete()
            for item in items_data:
                FoodItem.objects.create(menu=menu, **item)
        return menu

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if instance.date:
            instance.day_of_week = instance.date.strftime('%A')
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                FoodItem.objects.create(menu=instance, **item)
        return instance

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'

class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['ticket_id', 'created_at']

class ChefSerializer(serializers.ModelSerializer):
    avg_rating = serializers.SerializerMethodField()
    total_ratings = serializers.SerializerMethodField()

    class Meta:
        model = Chef
        fields = ['id', 'name', 'role', 'experience', 'speciality', 'working_days', 'description', 'photo', 'is_active', 'created_at', 'avg_rating', 'total_ratings']

    def get_avg_rating(self, obj):
        from django.db.models import Avg
        val = obj.ratings.aggregate(Avg('rating'))['rating__avg']
        return round(val, 1) if val else 0.0

    def get_total_ratings(self, obj):
        return obj.ratings.count()

class ChefRatingSerializer(serializers.ModelSerializer):
    chef_name = serializers.CharField(source='chef.name', read_only=True)

    class Meta:
        model = ChefRating
        fields = ['id', 'chef', 'chef_name', 'student', 'student_name', 'rating', 'comment', 'created_at']
        extra_kwargs = {
            'chef': {'required': False}
        }

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class ChefComplaintSerializer(serializers.ModelSerializer):
    chef_name = serializers.CharField(source='chef.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    accepted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ChefComplaint
        fields = [
            'id', 'ticket_id', 'chef', 'chef_name', 'student', 'student_name',
            'category', 'message', 'status', 'status_display',
            'resolution_note', 'rejection_reason',
            'accepted_at', 'accepted_by', 'accepted_by_name',
            'rejected_at', 'resolved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['ticket_id', 'created_at', 'updated_at', 'accepted_at', 'rejected_at', 'resolved_at']
        extra_kwargs = {
            'chef': {'required': False}
        }

    def get_accepted_by_name(self, obj):
        if obj.accepted_by:
            return obj.accepted_by.get_full_name() or obj.accepted_by.username
        return None

    def validate_status(self, value):
        status_map = {
            'pending': 'PENDING',
            'accepted': 'ACCEPTED',
            'in review': 'IN_REVIEW',
            'in_review': 'IN_REVIEW',
            'resolved': 'RESOLVED',
            'rejected': 'REJECTED'
        }
        val_clean = str(value).strip().lower()
        if val_clean in status_map:
            return status_map[val_clean]
        if str(value).upper() in ['PENDING', 'ACCEPTED', 'IN_REVIEW', 'RESOLVED', 'REJECTED']:
            return str(value).upper()
        raise serializers.ValidationError(f"Invalid status '{value}'. Allowed: PENDING, ACCEPTED, IN_REVIEW, RESOLVED, REJECTED.")
