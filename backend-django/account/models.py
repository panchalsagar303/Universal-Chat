from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
        ('hi', 'Hindi'),
        ('zh', 'Chinese'),
        ('ja', 'Japanese'),
        ('ru', 'Russian'),
        # Add more as needed, or make this a separate table for dynamic loading
    ]
    
    native_language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES,
        default='en',
        help_text="The language this user wants to receive messages in."
    )

    def __str__(self):
        return f"{self.username} ({self.native_language})"