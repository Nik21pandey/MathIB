import os
import dj_database_url
from .base import *

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = [
    h.strip() for h in config('ALLOWED_HOSTS', default='.onrender.com,.railway.app,.vercel.app,localhost,127.0.0.1').split(',')
    if h.strip()
]

DATABASE_URL = config('DATABASE_URL', default='')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173').split(',')
    if o.strip()
]
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in config('CSRF_TRUSTED_ORIGINS', default='https://*.onrender.com,https://*.vercel.app').split(',')
    if o.strip()
]

# Storage configuration (Supports Google Cloud Storage or FileSystem)
GS_BUCKET_NAME = config('GS_BUCKET_NAME', default='')
GS_PROJECT_ID = config('GS_PROJECT_ID', default='')
GS_DEFAULT_ACL = config('GS_DEFAULT_ACL', default=None)
GS_QUERYSTRING_AUTH = config('GS_QUERYSTRING_AUTH', default=False, cast=bool)

if GS_BUCKET_NAME:
    STORAGES = {
        "default": {
            "BACKEND": "core.storage.GoogleCloudMediaStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }

REDIS_URL = config('REDIS_URL', default='')
if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,
            'KEY_PREFIX': 'mathib',
            'TIMEOUT': 300,
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'mathib-prod-cache',
        }
    }

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = ('rest_framework.renderers.JSONRenderer',)

# --- PRODUCTION AUTH & CORS CONFIGURATION ---
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
CORS_ALLOW_CREDENTIALS = True
ALLOWED_HOSTS = [
    h.strip() for h in config('ALLOWED_HOSTS', default='.onrender.com,.railway.app,localhost,127.0.0.1,mathib.com,www.mathib.com').split(',')
    if h.strip()
]
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in config(
        'CORS_ALLOWED_ORIGINS',
        default='http://localhost:5173,https://mathib.com,https://www.mathib.com,https://math-ib.vercel.app'
    ).split(',')
    if o.strip()
]
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in config(
        'CSRF_TRUSTED_ORIGINS',
        default='https://*.onrender.com,https://*.vercel.app,https://math-ib.vercel.app,https://mathib.com,https://www.mathib.com'
    ).split(',')
    if o.strip()
]
ACCOUNT_EMAIL_VERIFICATION = 'none'

if 'core.slash_middleware.SlashlessMiddleware' not in MIDDLEWARE:
    MIDDLEWARE.insert(0, 'core.slash_middleware.SlashlessMiddleware')

# --- PERSISTENT S3 STORAGE (SUPABASE / CLOUDFLARE R2) & PDF WATERMARKING ---
ENABLE_PDF_WATERMARK = config('ENABLE_PDF_WATERMARK', default=True, cast=bool)

S3_BUCKET_NAME = config('S3_BUCKET_NAME', default='')
if S3_BUCKET_NAME:
    AWS_STORAGE_BUCKET_NAME = S3_BUCKET_NAME
    AWS_ACCESS_KEY_ID = config('S3_ACCESS_KEY_ID', default='')
    AWS_SECRET_ACCESS_KEY = config('S3_SECRET_ACCESS_KEY', default='')
    AWS_S3_ENDPOINT_URL = config('S3_ENDPOINT_URL', default='')
    AWS_S3_REGION_NAME = config('S3_REGION_NAME', default='auto')
    AWS_S3_ADDRESSING_STYLE = 'path'
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = True
    STORAGES['default'] = {
        'BACKEND': 'storages.backends.s3.S3Storage',
    }