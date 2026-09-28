import getpass
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db.models import Q

class Command(BaseCommand):
    help = 'Creates or updates a MessMate administrator account with securely hashed password.'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Admin username')
        parser.add_argument('--email', type=str, help='Admin email address')
        parser.add_argument('--password', type=str, help='Admin password (optional, prompted securely if omitted)')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('--- MessMate Admin Account Setup ---'))

        username = options.get('username')
        email = options.get('email')
        password = options.get('password')

        # Prompt for username if not provided
        if not username:
            username = input('Enter admin username (default: admin): ').strip() or 'admin'

        # Prompt for email if not provided
        if not email:
            email = input(f'Enter admin email for [{username}] (default: messmate.admin@gmail.com): ').strip() or 'messmate.admin@gmail.com'

        # Prompt securely for password if not provided
        if not password:
            while True:
                p1 = getpass.getpass('Enter new password: ')
                p2 = getpass.getpass('Confirm new password: ')
                if p1 != p2:
                    self.stdout.write(self.style.ERROR('Passwords do not match. Please try again.'))
                elif not p1:
                    self.stdout.write(self.style.ERROR('Password cannot be empty.'))
                else:
                    password = p1
                    break

        # Check if user already exists with this username or email
        user = User.objects.filter(Q(username=username) | Q(email__iexact=email)).first()

        if user:
            # Update existing user
            user.username = username
            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)  # Securely hashes with PBKDF2/SHA-256
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully updated administrator account: {user.username} ({user.email})'))
        else:
            # Create new superuser
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password  # create_superuser securely hashes password
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created new administrator account: {user.username} ({user.email})'))

        self.stdout.write(self.style.SUCCESS('Admin password securely hashed and saved. Plaintext password was not stored.'))
