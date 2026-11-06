from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN role or staff privileges.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_admin()
        return request.user.is_staff or request.user.is_superuser

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Authenticated users can read (GET, HEAD, OPTIONS).
    Only Admins can perform write mutations (POST, PUT, PATCH, DELETE).
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(request.user, 'profile'):
            return request.user.profile.is_admin()
        return request.user.is_staff or request.user.is_superuser

