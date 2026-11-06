from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid

from .serializers import UserSerializer, RegisterSerializer

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)
        if not user:
            # Check demo login fallback if user doesn't exist
            if username == 'operator' and password == 'admin123':
                user, _ = User.objects.get_or_create(
                    username='operator',
                    defaults={
                        'email': 'operator@smartev.io',
                        'first_name': 'Alex',
                        'last_name': 'Morgan'
                    }
                )
                user.set_password('admin123')
                user.save()
            else:
                return Response(
                    {'error': 'Invalid username or password.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # Generate lightweight auth token
        token = f"smartev_tok_{uuid.uuid4().hex}"

        return Response({
            'token': token,
            'user': UserSerializer(user).data,
            'role': 'Grid Operator' if user.is_staff else 'Fleet Manager'
        })

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = f"smartev_tok_{uuid.uuid4().hex}"
            return Response({
                'token': token,
                'user': UserSerializer(user).data,
                'role': 'Fleet Manager'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    def get(self, request):
        user = User.objects.filter(username='operator').first() or User.objects.first()
        if user:
            return Response({
                'user': UserSerializer(user).data,
                'role': 'Grid Operator'
            })
        return Response({'user': None, 'role': 'Guest'})
