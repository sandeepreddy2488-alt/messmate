from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, MenuViewSet, FoodItemViewSet, RatingViewSet, FeedbackViewSet,
    ComplaintViewSet, ChefViewSet, ChefRatingViewSet, ChefComplaintViewSet,
    MealAttendanceViewSet, DashboardStatsView, AuthLoginView, SetupAdminView
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'menus', MenuViewSet, basename='menu')
router.register(r'food-items', FoodItemViewSet, basename='food-item')
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'complaints', ComplaintViewSet, basename='complaint')
router.register(r'chefs', ChefViewSet, basename='chef')
router.register(r'chef-ratings', ChefRatingViewSet, basename='chef-rating')
router.register(r'chef-reviews', ChefRatingViewSet, basename='chef-review')
router.register(r'chef-complaints', ChefComplaintViewSet, basename='chef-complaint')
router.register(r'attendance', MealAttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('auth/login/', AuthLoginView.as_view(), name='auth-login'),
    path('auth/setup-admin/', SetupAdminView.as_view(), name='auth-setup-admin'),
]
