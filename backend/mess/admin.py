from django.contrib import admin
from .models import Student, Menu, FoodItem, Rating, Feedback, Complaint, MealAttendance

class FoodItemInline(admin.TabularInline):
    model = FoodItem
    extra = 1

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ('date', 'day_of_week', 'meal_type', 'start_time', 'end_time', 'is_special')
    list_filter = ('date', 'day_of_week', 'meal_type', 'is_special')
    inlines = [FoodItemInline]

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'roll_number', 'hostel_block', 'room_number', 'mess_card_id')
    search_fields = ('name', 'roll_number', 'mess_card_id')

@admin.register(MealAttendance)
class MealAttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'meal_type', 'swipe_time', 'created_at')
    list_filter = ('date', 'meal_type')
    search_fields = ('student__name', 'student__roll_number')

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'student_name', 'category', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'category')
    search_fields = ('ticket_id', 'student_name', 'description')

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('student_info', 'meal_type', 'rating', 'created_at')
    list_filter = ('meal_type', 'rating')

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('meal_type', 'overall_rating', 'taste_rating', 'hygiene_rating', 'created_at')
    list_filter = ('meal_type', 'overall_rating')
