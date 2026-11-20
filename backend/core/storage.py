"""
MathIB Storage Backends
Supports Google Cloud Storage (GCS), AWS S3, and Local FileSystem with seamless fallback.
"""

import json
import base64
import os
from django.conf import settings
from storages.backends.gcloud import GoogleCloudStorage
from google.oauth2 import service_account


def get_gcs_credentials():
    """
    Load Google Cloud service account credentials from:
    1. Base64 encoded JSON in GCS_CREDENTIALS_JSON or GS_CREDENTIALS
    2. Raw JSON string in GCS_CREDENTIALS_JSON or GS_CREDENTIALS
    3. File path in GOOGLE_APPLICATION_CREDENTIALS or GS_CREDENTIALS
    """
    raw = os.environ.get('GCS_CREDENTIALS_JSON') or os.environ.get('GS_CREDENTIALS') or ''
    if raw:
        raw_str = raw.strip()
        # 1. Try JSON directly
        if raw_str.startswith('{') and raw_str.endswith('}'):
            try:
                info = json.loads(raw_str)
                return service_account.Credentials.from_service_account_info(info)
            except Exception:
                pass
        # 2. Try Base64 encoded JSON
        try:
            decoded = base64.b64decode(raw_str).decode('utf-8')
            if decoded.strip().startswith('{'):
                info = json.loads(decoded)
                return service_account.Credentials.from_service_account_info(info)
        except Exception:
            pass
        # 3. Try file path
        if os.path.exists(raw_str):
            try:
                return service_account.Credentials.from_service_account_file(raw_str)
            except Exception:
                pass

    # 4. Standard GCP file path env var
    gac_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', '')
    if gac_path and os.path.exists(gac_path):
        try:
            return service_account.Credentials.from_service_account_file(gac_path)
        except Exception:
            pass

    return None


class GoogleCloudMediaStorage(GoogleCloudStorage):
    """
    Google Cloud Storage backend for user-uploaded past papers, mark schemes,
    thumbnails, and topical worksheets.
    """
    location = 'media'
    file_overwrite = False
    default_acl = getattr(settings, 'GS_DEFAULT_ACL', 'publicRead')

    def __init__(self, *args, **kwargs):
        creds = get_gcs_credentials()
        if creds and 'credentials' not in kwargs:
            kwargs['credentials'] = creds
        bucket_name = kwargs.get('bucket_name') or getattr(settings, 'GS_BUCKET_NAME', '') or os.environ.get('GS_BUCKET_NAME', '')
        if bucket_name:
            kwargs['bucket_name'] = bucket_name
        project_id = kwargs.get('project_id') or getattr(settings, 'GS_PROJECT_ID', '') or os.environ.get('GS_PROJECT_ID', '')
        if project_id:
            kwargs['project_id'] = project_id
        super().__init__(*args, **kwargs)
