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
            # Standard custom user models
            User.objects.create_superuser(username="admin", email=email, password=password)
        except Exception:
            # Custom user models without a username field
            User.objects.create_superuser(email=email, password=password)
        print("Superuser injected into database!")
    else:
        # Force reset password if user already exists
        u = User.objects.get(email=email)
        u.set_password(password)
        u.save()
        print("Admin password forcefully reset!")
except Exception as e:
    print(f"Error creating admin: {e}")
