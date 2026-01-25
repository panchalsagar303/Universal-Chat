from django.db import models
from django.conf import settings  # <--- Import settings

class Message(models.Model):
    # Use settings.AUTH_USER_MODEL. This automatically finds the correct User table.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}: {self.content[:20]}"