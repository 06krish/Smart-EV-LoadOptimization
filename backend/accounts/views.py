from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, RegisterSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_username = request.data.get('email', '') or request.data.get('username', '')
        password = request.data.get('password', '')

        if not email_or_username or not password:
            return Response(
                {'error': 'Please provide both email/username and password.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Allow user to sign in with email OR username
        user = None
        if '@' in email_or_username:
            user_obj = User.objects.filter(email__iexact=email_or_username).first()
            if user_obj:
                user = authenticate(username=user_obj.username, password=password)
        else:
            user = authenticate(username=email_or_username, password=password)

        if not user:
            # Automatic seed fallback for demo credentials (operator@smartev.io or operator / admin123)
            if email_or_username in ['operator@smartev.io', 'operator', 'admin@smartev.io'] and password == 'admin123':
                user, _ = User.objects.get_or_create(
                    username='operator',
                    defaults={
                        'email': 'operator@smartev.io',
                        'first_name': 'Alex',
                        'last_name': 'Morgan',
                        'is_staff': True
                    }
                )
                user.set_password('admin123')
                user.email = 'operator@smartev.io'
                user.save()
            else:
                return Response(
                    {'error': 'Invalid credentials. Please verify your email and password.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # Generate standard JWT Tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'role': 'Grid Operator' if user.is_staff else 'Fleet Manager'
        }, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'role': 'Fleet Manager'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    def get(self, request):
        if request.user and request.user.is_authenticated:
            return Response({
                'user': UserSerializer(request.user).data,
                'role': 'Grid Operator' if request.user.is_staff else 'Fleet Manager'
            })
        # Fallback for unauthenticated mock inspection
        user = User.objects.filter(username='operator').first() or User.objects.first()
        if user:
            return Response({
                'user': UserSerializer(user).data,
                'role': 'Grid Operator'
            })
        return Response({'user': None, 'role': 'Guest'})
