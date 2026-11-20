"""
Resilient JWT Authentication for MathIB.
Allows public endpoints to gracefully degrade to AnonymousUser if an expired
or stale token (e.g. from a cleared/reset database) is supplied in headers.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


class SafeJWTAuthentication(JWTAuthentication):
    """
    If a Bearer token is invalid, expired, or belongs to a user that no longer
    exists in the database, return None instead of immediately aborting with 401.
    
    This ensures:
    1. Public endpoints (AllowAny) still load for visitors with stale cookies/storage.
    2. Protected endpoints (IsAuthenticated) still reject unauthenticated users with 401/403.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, AuthenticationFailed):
            return None
