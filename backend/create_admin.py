import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.production")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
email = "admin@mathib.com"
password = "MathIB@2026!"

try:
    u = User.objects.filter(email=email).first()
    if not u and hasattr(User, 'USERNAME_FIELD') and User.USERNAME_FIELD == 'username':
        u = User.objects.filter(username="admin").first()

    if not u:
        try:
            u = User.objects.create_superuser(username="admin", email=email, password=password)
        except TypeError:
            u = User.objects.create_superuser(email=email, password=password)
        print("Created new superuser.")
    else:
        print("Found existing superuser, updating credentials.")

    u.email = email
    if hasattr(u, 'username') and not u.username:
        u.username = "admin"
    u.set_password(password)
    u.is_active = True
    u.is_staff = True
    u.is_superuser = True
    u.save()

    # Also mark verified in django-allauth if installed
    try:
        from allauth.account.models import EmailAddress
        EmailAddress.objects.update_or_create(
            user=u,
            email=email,
            defaults={'verified': True, 'primary': True}
        )
        print("Verified email in allauth.")
    except Exception:
        pass

    print("SUCCESS: Admin user is active, verified, and ready!")
except Exception as e:
    print(f"Error configuring admin: {e}")
