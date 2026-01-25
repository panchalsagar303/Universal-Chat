from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # This endpoint allows the frontend to download the user's profile
        # to know which "Room" to join or what their settings are.
        serializer = UserSerializer(request.user)
        return Response(serializer.data)