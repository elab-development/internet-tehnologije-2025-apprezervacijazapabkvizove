from __future__ import annotations

import logging

from django.http import JsonResponse, Http404
from django.core.exceptions import PermissionDenied

logger = logging.getLogger(__name__)


class ApiJsonErrorMiddleware:
   

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
        except Exception as exc:

            if not request.path.startswith("/api/"):
                raise

            if isinstance(exc, Http404):
                return JsonResponse(
                    {"error": {"type": "NotFound", "detail": "Not found."}},
                    status=404,
                )

            if isinstance(exc, PermissionDenied):
                return JsonResponse(
                    {"error": {"type": "PermissionDenied", "detail": "Permission denied."}},
                    status=403,
                )

            logger.exception("Unhandled API error", exc_info=exc)
            return JsonResponse(
                {"error": {"type": "ServerError", "detail": "Internal server error."}},
                status=500,
            )

        
        if request.path.startswith("/api/") and response.status_code == 404:
            return JsonResponse(
                {"error": {"type": "NotFound", "detail": "Not found."}},
                status=404,
            )

        return response
