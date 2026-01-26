from rest_framework import serializers
from .models import Message  # Assuming your model is in api/models.py

class MessageSerializer(serializers.ModelSerializer):
    # This magic line looks up the ID and finds the actual Username
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Message
        fields = ['id', 'content', 'username', 'timestamp']