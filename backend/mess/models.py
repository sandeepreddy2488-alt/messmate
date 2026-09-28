from django.db import models
from django.contrib.auth.models import User
import uuid

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    name = models.CharField(max_length=100)
    roll_number = models.CharField(max_length=50, unique=True)
    hostel_block = models.CharField(max_length=50, default='Block B')
    room_number = models.CharField(max_length=50, default='B-304')
    mess_card_id = models.CharField(max_length=50, unique=True)
    diet_preference = models.CharField(
        max_length=20,
        choices=[('Veg', 'Vegetarian'), ('Non-Veg', 'Non-Vegetarian'), ('Jain', 'Jain Diet')],
        default='Veg'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.roll_number})"

class Menu(models.Model):
    MEAL_CHOICES = [
        ('Breakfast', 'Breakfast'),
        ('Lunch', 'Lunch'),
        ('Snacks', 'Snacks'),
        ('Dinner', 'Dinner')
    ]
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday')
    ]
    STATUS_CHOICES = [
        ('Upcoming', 'Upcoming'),
        ('Serving Now', 'Serving Now'),
        ('Served', 'Served / Closed')
    ]
    date = models.DateField(null=True, blank=True)
    day_of_week = models.CharField(max_length=15, choices=DAY_CHOICES)
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    start_time = models.CharField(max_length=20, default='07:30 AM')
    end_time = models.CharField(max_length=20, default='09:30 AM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Upcoming')
    is_special = models.BooleanField(default=False)
    special_title = models.CharField(max_length=120, blank=True, default='')
    assigned_chef = models.ForeignKey('Chef', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_menus')

    class Meta:
        ordering = ['id']
        constraints = [
            models.UniqueConstraint(fields=['date', 'meal_type'], name='unique_menu_per_date_meal')
        ]

    def save(self, *args, **kwargs):
        if self.date:
            self.day_of_week = self.date.strftime('%A')
        if self.day_of_week:
            self.day_of_week = self.day_of_week.capitalize()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.date or self.day_of_week} {self.meal_type} ({self.status})"

class FoodItem(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=120)
    category = models.CharField(
        max_length=20,
        choices=[
            ('Veg', 'Veg'),
            ('Non-Veg', 'Non-Veg'),
            ('Special', 'Special'),
            ('Beverage', 'Beverage'),
            ('Dessert', 'Dessert')
        ],
        default='Veg'
    )
    calories = models.IntegerField(default=0)
    protein_g = models.IntegerField(default=0)
    is_chef_special = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.category})"

class MealAttendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    meal_type = models.CharField(max_length=20, choices=Menu.MEAL_CHOICES)
    swipe_time = models.CharField(max_length=20, default='08:20 AM', help_text='e.g. 08:20 AM')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'meal_type']
        constraints = [
            models.UniqueConstraint(fields=['student', 'date', 'meal_type'], name='unique_attendance_per_student_date_meal')
        ]

    def __str__(self):
        return f"{self.student.name} - {self.date} {self.meal_type} ({self.swipe_time})"

class Rating(models.Model):
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    meal_type = models.CharField(max_length=20, default='Lunch')
    overall_rating = models.IntegerField(default=5)
    taste_rating = models.IntegerField(default=4)
    hygiene_rating = models.IntegerField(default=5)
    temperature_rating = models.IntegerField(default=4)
    portion_rating = models.IntegerField(default=4)
    tags = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.meal_type} Rating: {self.overall_rating} Stars"

class Feedback(models.Model):
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    student_info = models.CharField(max_length=100, default='Hostel Resident')
    meal_type = models.CharField(max_length=20, default='Lunch')
    comment = models.TextField()
    is_anonymous = models.BooleanField(default=True)
    supervisor_reply = models.TextField(blank=True, default='')
    rating = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return f"Feedback for {self.meal_type}: {self.comment[:30]}"

class Complaint(models.Model):
    CATEGORY_CHOICES = [
        ('hygiene', 'Food Hygiene & Cleanliness'),
        ('quality', 'Poor Cooking / Stale Food'),
        ('water', 'RO Drinking Water / Dispenser Fault'),
        ('shortage', 'Food Shortage / Refill Delay'),
        ('cutlery', 'Unwashed Plates / Dirty Cutlery'),
        ('timing', 'Mess Timings / Unpunctual Service'),
        ('staff', 'Mess Staff Conduct'),
        ('other', 'Other Campus Mess Issue')
    ]
    PRIORITY_CHOICES = [
        ('low', 'Normal (24-48h)'),
        ('medium', 'Medium (Within 24h)'),
        ('urgent', 'Urgent (Hygiene Hazard)')
    ]
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved')
    ]

    ticket_id = models.CharField(max_length=20, unique=True, editable=False)
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    student_name = models.CharField(max_length=100, default='Rahul Sharma')
    room = models.CharField(max_length=50, default='Room B-304')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    meal = models.CharField(max_length=20, default='General')
    hall = models.CharField(max_length=100, default='Central Mess Hall 2 (Block B)')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    resolution_note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            import random
            self.ticket_id = f"CMP-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.ticket_id} - {self.category} ({self.status})"

class Chef(models.Model):
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=100, default='Head Chef')
    experience = models.CharField(max_length=50, default='5 Years')
    speciality = models.CharField(max_length=150, default='South Indian Meals')
    working_days = models.CharField(max_length=100, default='Monday - Sunday')
    description = models.TextField(blank=True, default='')
    photo = models.TextField(blank=True, default='', help_text='Image URL or Base64 encoded image data')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.role})"

class ChefRating(models.Model):
    chef = models.ForeignKey(Chef, on_delete=models.CASCADE, related_name='ratings')
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    student_name = models.CharField(max_length=100, default='Student')
    rating = models.IntegerField(default=5)  # 1 to 5
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return f"{self.chef.name} Rating: {self.rating} by {self.student_name}"

class ChefComplaint(models.Model):
    CATEGORY_CHOICES = [
        ('Food Quality', 'Food Quality'),
        ('Taste', 'Taste'),
        ('Hygiene', 'Hygiene'),
        ('Quantity', 'Quantity'),
        ('Behaviour', 'Behaviour'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('IN_REVIEW', 'In Review'),
        ('RESOLVED', 'Resolved'),
        ('REJECTED', 'Rejected'),
    ]

    ticket_id = models.CharField(max_length=20, unique=True, editable=False)
    chef = models.ForeignKey(Chef, on_delete=models.CASCADE, related_name='complaints')
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    student_name = models.CharField(max_length=100, default='Student')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Food Quality')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    resolution_note = models.TextField(blank=True, default='')
    rejection_reason = models.TextField(blank=True, default='')
    accepted_at = models.DateTimeField(null=True, blank=True)
    accepted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='accepted_chef_complaints')
    rejected_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            import random
            self.ticket_id = f"CH-CMP-{random.randint(1000, 9999)}"
        if self.status:
            status_map = {
                'pending': 'PENDING',
                'accepted': 'ACCEPTED',
                'in review': 'IN_REVIEW',
                'in_review': 'IN_REVIEW',
                'resolved': 'RESOLVED',
                'rejected': 'REJECTED'
            }
            clean_status = str(self.status).strip().lower()
            if clean_status in status_map:
                self.status = status_map[clean_status]
            elif str(self.status).upper() in ['PENDING', 'ACCEPTED', 'IN_REVIEW', 'RESOLVED', 'REJECTED']:
                self.status = str(self.status).upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.ticket_id} for Chef {self.chef.name} ({self.status})"
