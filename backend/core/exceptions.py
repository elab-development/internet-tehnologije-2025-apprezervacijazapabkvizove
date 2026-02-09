from __future__ import annotations

from typing import Any, Dict, Optional

from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError


def _flatten_errors(detail: Any) -> Any:
    """Convert DRF ErrorDetail / nested structures into plain python types."""
    if isinstance(detail, list):
        return [_flatten_errors(x) for x in detail]
    if isinstance(detail, dict):
        return {str(k): _flatten_errors(v) for k, v in detail.items()}
    return str(detail)


def custom_exception_handler(exc: Exception, context: Dict[str, Any]) -> Optional[Response]:
    """Return all DRF errors in a consistent JSON envelope."""
    response = drf_exception_handler(exc, context)

    
    if response is None:
        return None

    error_type = exc.__class__.__name__
    payload: Dict[str, Any] = {
        "error": {
            "type": error_type,
            "detail": "An error occurred.",
        }
    }

    if isinstance(exc, ValidationError):
        payload["error"]["detail"] = "Validation error."
        payload["error"]["fields"] = _flatten_errors(response.data)
    else:
        
        data = response.data
        if isinstance(data, dict) and "detail" in data:
            payload["error"]["detail"] = str(data["detail"])
        else:
            payload["error"]["detail"] = _flatten_errors(data)

    response.data = payload
    return response
