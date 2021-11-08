from rest_framework import permissions
from server.models import Book, Record, Request


class IsStaffOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff


class IsStaffOrReaderOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.reader == request.user or request.user.is_staff
        return request.user.is_staff
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS and view.kwargs:
            if 'reader' in view.kwargs:
                return request.user.is_staff or view.kwargs['reader'] == request.user.username
            if 'pk' in view.kwargs:
                return True
        return request.user.is_staff


class IsBookAvailable(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST':
            if Book.objects.get(title=request.data['book']).quantity < 1:
                return False
        return True


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser


class IsUniqueOrStaffOnly(permissions.BasePermission):
    """Readers can only view their own requests. Only unique pending requests can be created"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            if view.kwargs:
                return request.user.is_staff or view.kwargs['reader'] == request.user.username
            return request.user.is_staff
        requests = view.queryset.filter(reader=request.user, book=request.data['book'], status='pending')
        return not requests


class IsStaffOrSelfReadOnly(permissions.BasePermission):
    """Users can only view themselves while Staff has all permission"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj == request.user or request.user.is_staff
        return request.user.is_staff
    
    def has_permission(self, request, view):
        if 'pk' in view.kwargs or 'username' in view.kwargs:
            return True
        return request.user.is_staff
