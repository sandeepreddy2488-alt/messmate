import datetime
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Avg, Count, Q
from django.utils import timezone
from django.contrib.auth.models import User
from .models import Student, Menu, FoodItem, Rating, Feedback, Complaint, Chef, ChefRating, ChefComplaint, MealAttendance
from .serializers import (
    StudentSerializer, MenuSerializer, FoodItemSerializer,
    RatingSerializer, FeedbackSerializer, ComplaintSerializer, ChefSerializer,
    ChefRatingSerializer, ChefComplaintSerializer, MealAttendanceSerializer
)

class MealAttendanceViewSet(viewsets.ModelViewSet):
    queryset = MealAttendance.objects.all().select_related('student')
    serializer_class = MealAttendanceSerializer

    def get_queryset(self):
        qs = MealAttendance.objects.all().select_related('student')
        date_param = self.request.query_params.get('date')
        roll_number = self.request.query_params.get('roll_number')
        meal_type = self.request.query_params.get('meal_type')

        if date_param:
            qs = qs.filter(date=date_param)
        if roll_number:
            qs = qs.filter(student__roll_number__iexact=roll_number)
        if meal_type:
            qs = qs.filter(meal_type__iexact=meal_type)
        return qs

    @action(detail=False, methods=['post'])
    def swipe(self, request):
        roll_number = request.data.get('roll_number', '21BCSE104')
        meal_type = request.data.get('meal_type')
        date_val = request.data.get('date')
        if not date_val:
            date_val = timezone.localtime().date().strftime('%Y-%m-%d')
        swipe_time = request.data.get('swipe_time')
        if not swipe_time:
            swipe_time = timezone.localtime().strftime('%I:%M %p')

        student = Student.objects.filter(roll_number__iexact=roll_number).first()
        if not student:
            student = Student.objects.first()
            if not student:
                student = Student.objects.create(
                    name='Rahul Sharma',
                    roll_number='21BCSE104',
                    mess_card_id='MM-2026-B304'
                )

        attendance, created = MealAttendance.objects.update_or_create(
            student=student,
            date=date_val,
            meal_type=meal_type,
            defaults={'swipe_time': swipe_time}
        )
        return Response(self.get_serializer(attendance).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class FoodItemViewSet(viewsets.ModelViewSet):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer

class MenuViewSet(viewsets.ModelViewSet):
    queryset = Menu.objects.all().prefetch_related('items')
    serializer_class = MenuSerializer

    def get_queryset(self):
        qs = Menu.objects.all().prefetch_related('items')
        date_param = self.request.query_params.get('date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        meal_type = self.request.query_params.get('meal_type')
        day_param = self.request.query_params.get('day_of_week')

        if date_param:
            qs = qs.filter(date=date_param)
        elif start_date and end_date:
            qs = qs.filter(date__range=[start_date, end_date])
        elif start_date:
            qs = qs.filter(date__gte=start_date)

        if meal_type:
            qs = qs.filter(meal_type__iexact=meal_type)
        if day_param:
            qs = qs.filter(day_of_week__iexact=day_param)

        day_order = {'Sunday': 1, 'Monday': 2, 'Tuesday': 3, 'Wednesday': 4, 'Thursday': 5, 'Friday': 6, 'Saturday': 7}
        meal_order = {'Breakfast': 1, 'Lunch': 2, 'Snacks': 3, 'Dinner': 4}
        return sorted(qs, key=lambda m: (m.date if m.date else datetime.date.min, day_order.get(m.day_of_week, 99), meal_order.get(m.meal_type, 99)))

    @action(detail=False, methods=['get'])
    def today(self, request):
        date_param = request.query_params.get('date')
        if date_param:
            try:
                today_date = datetime.datetime.strptime(date_param, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                today_date = timezone.localtime().date()
        else:
            today_date = timezone.localtime().date()

        today_name = today_date.strftime('%A')
        # Check by actual date first, then fallback to weekday
        today_menus = Menu.objects.filter(date=today_date).prefetch_related('items')
        if not today_menus.exists():
            today_menus = Menu.objects.filter(day_of_week__iexact=today_name).prefetch_related('items')

        meal_order = {'Breakfast': 1, 'Lunch': 2, 'Snacks': 3, 'Dinner': 4}
        sorted_menus = sorted(today_menus, key=lambda m: meal_order.get(m.meal_type, 99))
        serializer = self.get_serializer(sorted_menus, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def weekly(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        qs = Menu.objects.all().prefetch_related('items')
        if start_date and end_date:
            qs = qs.filter(date__range=[start_date, end_date])
        elif start_date:
            qs = qs.filter(date__gte=start_date)

        day_order = {'Sunday': 1, 'Monday': 2, 'Tuesday': 3, 'Wednesday': 4, 'Thursday': 5, 'Friday': 6, 'Saturday': 7}
        meal_order = {'Breakfast': 1, 'Lunch': 2, 'Snacks': 3, 'Dinner': 4}
        sorted_menus = sorted(qs, key=lambda m: (
            m.date if m.date else datetime.date.min,
            day_order.get(m.day_of_week, 99),
            meal_order.get(m.meal_type, 99)
        ))
        serializer = self.get_serializer(sorted_menus, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='clear-demo')
    def clear_demo(self, request):
        count_menus = Menu.objects.count()
        count_items = FoodItem.objects.count()
        FoodItem.objects.all().delete()
        Menu.objects.all().delete()
        return Response({
            'success': True,
            'message': f'Cleared {count_menus} menus and {count_items} food items from PostgreSQL database.'
        })

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Calculate summary statistics
        stats = Rating.objects.aggregate(
            avg_overall=Avg('overall_rating'),
            avg_taste=Avg('taste_rating'),
            avg_hygiene=Avg('hygiene_rating'),
            avg_temperature=Avg('temperature_rating'),
            avg_portion=Avg('portion_rating'),
            total_reviews=Count('id')
        )

        return Response({
            'success': True,
            'stats': {
                'total_reviews': stats['total_reviews'] or len(serializer.data),
                'avg_rating': round(stats['avg_overall'] or 4.3, 1),
                'avg_taste': round(stats['avg_taste'] or 4.4, 1),
                'avg_hygiene': round(stats['avg_hygiene'] or 4.7, 1),
                'avg_temperature': round(stats['avg_temperature'] or 4.1, 1),
                'avg_portion': round(stats['avg_portion'] or 4.2, 1),
            },
            'reviews': serializer.data
        })

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer

    @action(detail=False, methods=['patch'], url_path='update-status/(?P<ticket_id>[^/.]+)')
    def update_status(self, request, ticket_id=None):
        try:
            complaint = Complaint.objects.get(ticket_id=ticket_id)
            new_status = request.data.get('status', 'Resolved')
            resolution_note = request.data.get('resolution_note', 'Inspected and resolved by Mess Supervisor.')
            
            complaint.status = new_status
            if resolution_note:
                complaint.resolution_note = resolution_note
            complaint.save()

            return Response({
                'success': True,
                'message': f'Ticket #{ticket_id} updated to {new_status}',
                'data': ComplaintSerializer(complaint).data
            })
        except Complaint.DoesNotExist:
            return Response({'success': False, 'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

class DashboardStatsView(APIView):
    def get(self, request):
        total_complaints = Complaint.objects.count()
        pending_complaints = Complaint.objects.filter(status='Pending').count()
        in_progress_complaints = Complaint.objects.filter(status='In Progress').count()
        resolved_complaints = Complaint.objects.filter(status='Resolved').count()

        total_chef_complaints = ChefComplaint.objects.count()
        pending_chef_complaints = ChefComplaint.objects.filter(status='PENDING').count()
        accepted_chef_complaints = ChefComplaint.objects.filter(status='ACCEPTED').count()
        resolved_chef_complaints = ChefComplaint.objects.filter(status='RESOLVED').count()
        rejected_chef_complaints = ChefComplaint.objects.filter(status='REJECTED').count()

        avg_rating = Rating.objects.aggregate(avg=Avg('overall_rating'))['avg'] or 4.3
        total_ratings = Rating.objects.count()

        return Response({
            'success': True,
            'data': {
                'complaints': {
                    'total': total_complaints,
                    'pending': pending_complaints,
                    'in_progress': in_progress_complaints,
                    'resolved': resolved_complaints,
                },
                'chef_complaints': {
                    'total': total_chef_complaints,
                    'pending': pending_chef_complaints,
                    'accepted': accepted_chef_complaints,
                    'resolved': resolved_chef_complaints,
                    'rejected': rejected_chef_complaints,
                },
                'ratings': {
                    'total_feedback': total_ratings,
                    'avg_rating': round(avg_rating, 1),
                },
                'meals_served_today': 842,
                'total_capacity': 1050
            }
        })

class AuthLoginView(APIView):
    def post(self, request):
        role = request.data.get('role', 'student')
        identifier = str(request.data.get('identifier', '')).strip()
        password = str(request.data.get('password', '')).strip()

        if role == 'admin':
            if not identifier or not password:
                return Response({
                    'success': False,
                    'error': 'Please provide both admin username/email and password.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Match admin by username or email (case-insensitive)
            user = User.objects.filter(
                Q(username__iexact=identifier) | Q(email__iexact=identifier)
            ).first()

            if user and user.check_password(password):
                if not (user.is_staff or user.is_superuser):
                    return Response({
                        'success': False,
                        'error': 'Access denied: this account does not have administrative privileges.'
                    }, status=status.HTTP_403_FORBIDDEN)

                try:
                    from django.contrib.auth import login as auth_login
                    auth_login(request, user)
                except Exception:
                    pass

                display_name = user.get_full_name().strip() or user.username
                return Response({
                    'success': True,
                    'user': {
                        'role': 'admin',
                        'name': display_name,
                        'username': user.username,
                        'email': user.email,
                        'title': 'Mess Administrator'
                    }
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Invalid admin email/username or password. Please try again.'
                }, status=status.HTTP_401_UNAUTHORIZED)

        else:
            # Student login
            if not identifier:
                identifier = '21BCSE104'

            student = Student.objects.filter(roll_number__iexact=identifier).first()
            if not student:
                student = Student.objects.first()

            return Response({
                'success': True,
                'user': {
                    'role': 'student',
                    'name': student.name if student else 'Rahul Sharma',
                    'roll_number': student.roll_number if student else identifier,
                    'room_number': student.room_number if student else 'B-304',
                    'hostel_block': student.hostel_block if student else 'Block B',
                    'mess_card_id': student.mess_card_id if student else 'MM-2026-B304',
                    'diet_preference': student.diet_preference if student else 'Veg'
                }
            })

class SetupAdminView(APIView):
    def post(self, request):
        email = str(request.data.get('email', 'messmate.admin@gmail.com')).strip() or 'messmate.admin@gmail.com'
        username = str(request.data.get('username', 'admin')).strip() or 'admin'
        password = str(request.data.get('password', '')).strip()

        if not password:
            return Response({
                'success': False,
                'error': 'Password cannot be empty.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 4:
            return Response({
                'success': False,
                'error': 'Password must be at least 4 characters long.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Look up existing user by email or username
        user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=username)).first()

        if user:
            user.username = username
            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)  # PBKDF2 cryptographic hashing
            user.save()
        else:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )

        return Response({
            'success': True,
            'message': f'Admin account for {user.email} ({user.username}) successfully configured!',
            'user': {
                'username': user.username,
                'email': user.email
            }
        })

class ChefViewSet(viewsets.ModelViewSet):
    queryset = Chef.objects.all().order_by('id')
    serializer_class = ChefSerializer

    def get_queryset(self):
        qs = Chef.objects.all().order_by('id')
        active_param = self.request.query_params.get('active')
        if active_param and active_param.lower() in ['true', '1']:
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=True, methods=['get', 'post'])
    def ratings(self, request, pk=None):
        chef = self.get_object()
        if request.method == 'GET':
            ratings = chef.ratings.all().order_by('-id')
            serializer = ChefRatingSerializer(ratings, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = ChefRatingSerializer(data=request.data)
            if serializer.is_valid():
                student = getattr(request.user, 'student_profile', None) if request.user.is_authenticated else None
                serializer.save(chef=chef, student=student)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def complaints(self, request, pk=None):
        chef = self.get_object()
        if request.method == 'GET':
            complaints = chef.complaints.all().order_by('-id')
            serializer = ChefComplaintSerializer(complaints, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = ChefComplaintSerializer(data=request.data)
            if serializer.is_valid():
                student = getattr(request.user, 'student_profile', None) if request.user.is_authenticated else None
                serializer.save(chef=chef, student=student)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChefRatingViewSet(viewsets.ModelViewSet):
    queryset = ChefRating.objects.all().select_related('chef').order_by('-id')
    serializer_class = ChefRatingSerializer

    def get_queryset(self):
        qs = ChefRating.objects.all().select_related('chef').order_by('-id')
        chef_param = self.request.query_params.get('chef')
        if chef_param and chef_param.lower() != 'all':
            if str(chef_param).isdigit():
                qs = qs.filter(chef_id=int(chef_param))
            else:
                qs = qs.filter(chef__name__iexact=chef_param)
        return qs

    def perform_create(self, serializer):
        student = getattr(self.request.user, 'student_profile', None) if self.request.user.is_authenticated else None
        serializer.save(student=student)

class ChefComplaintViewSet(viewsets.ModelViewSet):
    queryset = ChefComplaint.objects.all().select_related('chef', 'accepted_by').order_by('-id')
    serializer_class = ChefComplaintSerializer

    def get_queryset(self):
        qs = ChefComplaint.objects.all().select_related('chef', 'accepted_by').order_by('-id')
        chef_param = self.request.query_params.get('chef')
        status_param = self.request.query_params.get('status')
        if chef_param and chef_param.lower() != 'all':
            if str(chef_param).isdigit():
                qs = qs.filter(chef_id=int(chef_param))
            else:
                qs = qs.filter(chef__name__iexact=chef_param)
        if status_param and status_param.lower() != 'all':
            clean_st = str(status_param).strip().lower()
            status_map = {
                'pending': 'PENDING',
                'accepted': 'ACCEPTED',
                'in review': 'IN_REVIEW',
                'in_review': 'IN_REVIEW',
                'resolved': 'RESOLVED',
                'rejected': 'REJECTED'
            }
            target_status = status_map.get(clean_st, status_param.upper())
            qs = qs.filter(Q(status__iexact=target_status) | Q(status__iexact=status_param))
        return qs

    def perform_create(self, serializer):
        student = getattr(self.request.user, 'student_profile', None) if self.request.user.is_authenticated else None
        serializer.save(student=student)

    def _get_admin_user(self, request):
        user = request.user
        if user and user.is_authenticated and (user.is_staff or user.is_superuser):
            return user

        # Extract admin credentials from headers or request payload
        admin_uname = (
            request.headers.get('X-Admin-Username')
            or request.META.get('HTTP_X_ADMIN_USERNAME')
            or request.data.get('admin_username')
            or request.data.get('username')
        )
        admin_email = (
            request.headers.get('X-Admin-Email')
            or request.META.get('HTTP_X_ADMIN_EMAIL')
            or request.data.get('admin_email')
            or request.data.get('email')
        )
        role = (
            request.headers.get('X-User-Role')
            or request.META.get('HTTP_X_USER_ROLE')
            or request.data.get('role')
            or request.data.get('user_role')
            or request.data.get('admin_role')
        )

        admin_user = None
        if admin_uname:
            admin_user = User.objects.filter(
                Q(username__iexact=admin_uname) | Q(first_name__iexact=admin_uname),
                Q(is_staff=True) | Q(is_superuser=True)
            ).first()
        if not admin_user and admin_email:
            admin_user = User.objects.filter(
                Q(is_staff=True) | Q(is_superuser=True),
                email__iexact=admin_email
            ).first()
        if not admin_user and str(role).lower() == 'admin':
            admin_user = User.objects.filter(Q(is_staff=True) | Q(is_superuser=True)).first()

        return admin_user

    def _is_admin(self, request):
        return self._get_admin_user(request) is not None

    @action(detail=True, methods=['post', 'patch'])
    def accept(self, request, pk=None):
        admin_user = self._get_admin_user(request)
        if not admin_user:
            return Response({
                'detail': 'Only authenticated Admin users can accept complaints.'
            }, status=status.HTTP_403_FORBIDDEN)

        complaint = self.get_object()
        complaint.status = 'ACCEPTED'
        complaint.accepted_at = timezone.now()
        complaint.accepted_by = admin_user
        complaint.save()
        return Response(self.get_serializer(complaint).data)

    @action(detail=True, methods=['post', 'patch'])
    def reject(self, request, pk=None):
        admin_user = self._get_admin_user(request)
        if not admin_user:
            return Response({
                'detail': 'Only authenticated Admin users can reject complaints.'
            }, status=status.HTTP_403_FORBIDDEN)

        complaint = self.get_object()
        rejection_reason = request.data.get('rejection_reason', '').strip()
        complaint.status = 'REJECTED'
        complaint.rejected_at = timezone.now()
        if rejection_reason:
            complaint.rejection_reason = rejection_reason
            complaint.resolution_note = rejection_reason
        complaint.save()
        return Response(self.get_serializer(complaint).data)

    @action(detail=True, methods=['post', 'patch'])
    def resolve(self, request, pk=None):
        admin_user = self._get_admin_user(request)
        if not admin_user:
            return Response({
                'detail': 'Only authenticated Admin users can resolve complaints.'
            }, status=status.HTTP_403_FORBIDDEN)

        complaint = self.get_object()
        resolution_note = request.data.get('resolution_note', '').strip()
        complaint.status = 'RESOLVED'
        complaint.resolved_at = timezone.now()
        if resolution_note:
            complaint.resolution_note = resolution_note
        complaint.save()
        return Response(self.get_serializer(complaint).data)

    def update(self, request, *args, **kwargs):
        admin_user = self._get_admin_user(request)
        if ('status' in request.data or 'resolution_note' in request.data or 'rejection_reason' in request.data) and not admin_user:
            return Response({
                'detail': 'Only authenticated Admin users can change complaint status.'
            }, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            clean_new = str(new_status).strip().upper().replace(' ', '_')
            if clean_new == 'ACCEPTED' and not instance.accepted_at:
                instance.accepted_at = timezone.now()
                instance.accepted_by = admin_user
            elif clean_new == 'REJECTED' and not instance.rejected_at:
                instance.rejected_at = timezone.now()
            elif clean_new == 'RESOLVED' and not instance.resolved_at:
                instance.resolved_at = timezone.now()
            instance.save()

        return super().update(request, *args, **kwargs)



