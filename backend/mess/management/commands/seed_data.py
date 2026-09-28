from django.core.management.base import BaseCommand
from mess.models import Student, Menu, FoodItem, Rating, Feedback, Complaint

class Command(BaseCommand):
    help = 'Seeds initial sample data into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Beginning database seeding...'))

        # 1. Student Profile
        student, created = Student.objects.get_or_create(
            roll_number='21BCSE104',
            defaults={
                'name': 'Rahul Sharma',
                'hostel_block': 'Block B',
                'room_number': 'B-304',
                'mess_card_id': 'MM-2026-B304',
                'diet_preference': 'Veg'
            }
        )

        # 2. Menus and FoodItems for the 7 days
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        meals = [
            ('Breakfast', '07:30 AM', '09:30 AM'),
            ('Lunch', '12:30 PM', '02:30 PM'),
            ('Snacks', '05:00 PM', '06:00 PM'),
            ('Dinner', '07:30 PM', '09:30 PM')
        ]

        sample_dishes = {
            'Monday': {
                'Breakfast': [('Aloo Paratha with Butter', 'Veg', 380, 8, True), ('Curd & Mango Pickle', 'Veg', 90, 4, False), ('Hot Masala Chai', 'Beverage', 70, 2, False)],
                'Lunch': [('Punjabi Rajma Masala', 'Veg', 280, 14, True), ('Steamed Basmati Rice', 'Veg', 210, 5, False), ('Mix Veg Dry', 'Veg', 120, 3, False), ('Soft Phulka', 'Veg', 150, 4, False), ('Boondi Raita', 'Veg', 90, 3, False)],
                'Snacks': [('Crispy Bread Pakora', 'Veg', 240, 5, False), ('Green Mint Chutney', 'Veg', 30, 1, False), ('Cardamom Chai', 'Beverage', 70, 2, False)],
                'Dinner': [('Matar Paneer', 'Veg', 320, 12, True), ('Dal Fry & Jeera Rice', 'Veg', 260, 8, False), ('Tawa Chapati', 'Veg', 140, 4, False), ('Rice Kheer', 'Dessert', 220, 5, True)]
            },
            'Sunday': {
                'Breakfast': [('Steamed Idli & Medu Vada', 'Veg', 290, 9, False), ('Vegetable Sambar & Coconut Chutney', 'Veg', 140, 5, False), ('Indori Poha with Peanuts', 'Veg', 220, 6, False), ('Filter Coffee', 'Beverage', 80, 2, False)],
                'Lunch': [('Shahi Paneer Butter Masala', 'Special', 380, 15, True), ('Dal Tadka (Double Fried Jeera)', 'Veg', 180, 9, False), ('Jeera Rice & Ghee Phulka', 'Veg', 280, 6, False), ('Fresh Dahi (Curd) & Salad', 'Veg', 80, 4, False), ('Warm Gulab Jamun (2 pcs)', 'Dessert', 260, 4, True)],
                'Snacks': [('Crispy Potato Samosa', 'Veg', 260, 4, False), ('Mint-Coriander Chutney', 'Veg', 30, 1, False), ('Ginger Cardamom Tea', 'Beverage', 70, 2, False)],
                'Dinner': [('Mixed Vegetable Korma', 'Veg', 240, 7, False), ('Yellow Moong Dal', 'Veg', 160, 8, False), ('Tawa Chapati & Rice', 'Veg', 250, 5, False), ('Fresh Cut Watermelon', 'Dessert', 70, 1, False)]
            }
        }

        # Create base menus for all days
        for day in days:
            dishes_for_day = sample_dishes.get(day, sample_dishes['Sunday'])
            for meal_name, s_time, e_time in meals:
                menu, _ = Menu.objects.get_or_create(
                    day_of_week=day,
                    meal_type=meal_name,
                    defaults={
                        'start_time': s_time,
                        'end_time': e_time,
                        'is_special': (meal_name == 'Lunch' and day in ['Wednesday', 'Sunday']),
                        'special_title': 'Chef Special Feast' if (meal_name == 'Lunch' and day in ['Wednesday', 'Sunday']) else ''
                    }
                )

                items = dishes_for_day.get(meal_name, dishes_for_day['Lunch'])
                for item_name, cat, cal, prot, spec in items:
                    FoodItem.objects.get_or_create(
                        menu=menu,
                        name=item_name,
                        defaults={
                            'category': cat,
                            'calories': cal,
                            'protein_g': prot,
                            'is_chef_special': spec
                        }
                    )

        # 3. Initial Complaints
        Complaint.objects.get_or_create(
            ticket_id='CMP-4921',
            defaults={
                'student': student,
                'student_name': 'Rahul Sharma',
                'room': 'Room B-304',
                'category': 'water',
                'meal': 'Lunch',
                'hall': 'Central Mess Hall 2 (Block B)',
                'priority': 'urgent',
                'description': 'The RO purifier tap on the second floor of Central Mess Hall 2 had muddy sediment and weak flow.',
                'status': 'Resolved',
                'resolution_note': 'Pre-filter candle and sediment cartridge replaced on Sept 20, 09:30 AM. TDS tested at 85 ppm (optimal). Tap functioning normally.'
            }
        )

        Complaint.objects.get_or_create(
            ticket_id='CMP-5014',
            defaults={
                'student': student,
                'student_name': 'Rahul Sharma',
                'room': 'Room B-304',
                'category': 'quality',
                'meal': 'Dinner',
                'hall': 'Central Mess Hall 2 (Block B)',
                'priority': 'medium',
                'description': 'Chapati container was empty at 8:40 PM during dinner, and subsequent rotis brought out were cold and hard.',
                'status': 'In Progress',
                'resolution_note': 'Investigated with head chef. Electric casserole heating element was found switched off. Written warning issued to buffet attendant.'
            }
        )

        Complaint.objects.get_or_create(
            ticket_id='CMP-5088',
            defaults={
                'student': None,
                'student_name': 'Ananya Patel',
                'room': 'Room C-112',
                'category': 'hygiene',
                'meal': 'Lunch',
                'hall': 'Central Mess Hall 1 (Block A)',
                'priority': 'urgent',
                'description': 'Large curry spill on dining table 14 was left unattended for 20 minutes attracting houseflies.',
                'status': 'Pending',
                'resolution_note': ''
            }
        )

        # 4. Initial Feedback & Reviews
        Feedback.objects.get_or_create(
            comment='Paneer butter masala today was really rich and not overly oily. Rotis were served piping hot from the tawa!',
            defaults={
                'student': student,
                'student_info': '3rd Year B.Tech (Block B)',
                'meal_type': 'Lunch',
                'is_anonymous': False,
                'rating': 5,
                'supervisor_reply': ''
            }
        )

        Feedback.objects.get_or_create(
            comment='The evening tea sugar level was high yesterday. Can we have separate sugar sachets or lower base sweetness?',
            defaults={
                'student': None,
                'student_info': 'M.Tech Resident (Block A)',
                'meal_type': 'Snacks',
                'is_anonymous': False,
                'rating': 3,
                'supervisor_reply': 'Noted! We have instructed the team to keep a no-sugar milk tea pot alongside the regular brew starting today.'
            }
        )

        # 5. Initial Ratings
        Rating.objects.get_or_create(
            student=student,
            meal_type='Lunch',
            defaults={
                'overall_rating': 5,
                'taste_rating': 5,
                'hygiene_rating': 5,
                'temperature_rating': 4,
                'portion_rating': 5,
                'tags': 'Delicious Gravy, Soft Phulkas, Gulab Jamun was great'
            }
        )
        Rating.objects.get_or_create(
            meal_type='Snacks',
            defaults={
                'overall_rating': 4,
                'taste_rating': 4,
                'hygiene_rating': 4,
                'temperature_rating': 4,
                'portion_rating': 4,
                'tags': 'Hot Chai, Good portion'
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all initial MessMate data!'))

