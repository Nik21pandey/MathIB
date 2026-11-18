class SlashlessMiddleware:
    """Allows POST/GET requests without trailing slashes to resolve in Django without 301 redirects."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from django.urls import resolve, Resolver404
        if not request.path_info.endswith('/'):
            try:
                resolve(request.path_info)
            except Resolver404:
                try:
                    resolve(request.path_info + '/')
                    request.path_info = request.path_info + '/'
                    request.path = request.path + '/'
                except Resolver404:
                    pass
        return self.get_response(request)
