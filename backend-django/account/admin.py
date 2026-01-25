from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'native_language', 'is_staff']

    # FIX: Convert the original tuple to a list() first, then add our list
    fieldsets = list(UserAdmin.fieldsets) + [
        (None, {'fields': ('native_language',)}),
    ]

    # FIX: Do the same for add_fieldsets
    add_fieldsets = list(UserAdmin.add_fieldsets) + [
        (None, {'fields': ('native_language',)}),
    ]

admin.site.register(CustomUser, CustomUserAdmin)