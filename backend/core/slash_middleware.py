class SlashlessMiddleware:
    """Deduplicates doubled /api/v1 prefixes and resolves paths without trailing slashes."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from django.urls import resolve, Resolver404

        if '/api/v1/' in request.path_info:
            idx = request.path_info.rfind('/api/v1/')
            if idx > 0:
                request.path_info = request.path_info[idx:]
                request.path = request.path_info

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
