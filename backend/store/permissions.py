
from rest_framework import permissions


def get_effective_roles(user) -> set[str]:
    """
    Map Django auth state + group membership to a set of effective roles.

    We keep legacy behaviour: staff users are treated as `admin`.
    """

    if not user or not user.is_authenticated:
        return set()

    roles: set[str] = {"customer"}

    if getattr(user, "is_staff", False):
        roles.add("admin")

    # Optional group-based roles (no schema changes required).
    # Example: create a Django group named "analytics_admin" and assign it
    # to users who should access analytics features.
    group_names = set(user.groups.values_list("name", flat=True))
    for role in {"manager", "support", "nutritionist", "analytics_admin"}:
        if role in group_names:
            roles.add(role)

    return roles


class HasAnyRole(permissions.BasePermission):
    """
    Permission helper for role-aware access control.

    Usage:
        permission_classes = [HasAnyRole]
        allowed_roles = ['admin', 'support']
    """

    allowed_roles: set[str] = set()

    def has_permission(self, request, view):
        effective = get_effective_roles(getattr(request, "user", None))
        return bool(effective.intersection(self.allowed_roles))


class IsAdminRole(HasAnyRole):
    allowed_roles = {"admin"}


class IsAnalyticsRole(HasAnyRole):
    allowed_roles = {"admin", "analytics_admin"}


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if  request.method in permissions.SAFE_METHODS:
            return True
        effective = get_effective_roles(getattr(request, "user", None))
        return bool(effective.intersection({"admin"}))
    
    
class ViewCustomerHistoryPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False

        # Legacy path: if Django permissions are configured, keep supporting it.
        if user.has_perm("store.view_history"):
            return True

        # RBAC path: allow admin/support/analytics_admin.
        effective = get_effective_roles(user)
        return bool(effective.intersection({"admin", "support", "analytics_admin"}))