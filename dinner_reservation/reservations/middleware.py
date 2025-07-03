class LogHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("📡 Incoming headers:")
        for k, v in request.META.items():
            if k.startswith("HTTP_"):
                print(f"{k}: {v}")
        return self.get_response(request)