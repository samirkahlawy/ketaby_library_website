from django import template
from django.contrib.auth.models import User

register = template.Library()


@register.filter
def is_librarian(user):
    """Check if user is a librarian (staff or has is_librarian=True in profile)."""
    if not user or not user.is_authenticated:
        return False
    if user.is_staff:
        return True
    if hasattr(user, "profile"):
        return bool(getattr(user.profile, "is_librarian", False))
    return False
