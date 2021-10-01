from rest_framework import permissions


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
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_staff or view.kwargs['reader'] == request.user.username 
        return request.user.is_staff



class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff
