import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.production")
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
email = "admin@mathib.com"
password = "MathIB@2026!"

try:
    if not User.objects.filter(email=email).exists():
        try:
            # If your custom user model requires a username
            User.objects.create_superuser(username="admin", email=email, password=password)
        except Exception:
            # If your custom user model only uses email
            User.objects.create_superuser(email=email, password=password)
        print("Superuser injected into database!")
    else:
        # If the user exists but the password got scrambled, force reset it
        u = User.objects.get(email=email)
        u.set_password(password)
        u.save()
        print("Admin password forcefully reset!")
except Exception as e:
    print(f"Error creating admin: {e}")
