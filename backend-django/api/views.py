from rest_framework import generics, permissions
from .models import Message
from .serializers import MessageSerializer

class MessageListView(generics.ListAPIView):
    # Get all messages, ordered by time
    queryset = Message.objects.all().order_by('timestamp')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]