from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    GET/HEAD/OPTIONS dozvoljeni svima,
    a POST/PUT/PATCH/DELETE samo autentifikovanim korisnicima.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:  
            return True
        return bool(request.user and request.user.is_authenticated)
