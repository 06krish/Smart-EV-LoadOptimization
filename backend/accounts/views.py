from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import UserSerializer, RegisterSerializer
from .permissions import IsAdminUserRole

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_username = request.data.get('email', '') or request.data.get('username', '')
        password = request.data.get('password', '')
        requested_portal = request.data.get('portal', '').upper() # 'ADMIN' or 'USER'

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
            # Seed demo accounts if not yet created:
            # 1. Admin: admin@smartev.io or operator@smartev.io / admin123
            # 2. User: user@smartev.io / user123
            if email_or_username in ['admin@smartev.io', 'operator@smartev.io', 'admin', 'operator'] and password == 'admin123':
                user, _ = User.objects.get_or_create(
                    username='admin_operator',
                    defaults={
                        'email': 'admin@smartev.io',
                        'first_name': 'Alex',
                        'last_name': 'Morgan',
                        'is_staff': True,
                        'is_superuser': True
                    }
                )
                user.set_password('admin123')
                user.is_staff = True
                user.save()
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.role = 'ADMIN'
                profile.company = 'Metro Central Grid Hub'
                profile.save()

            elif email_or_username in ['user@smartev.io', 'user', 'driver@smartev.io'] and password in ['user123', 'admin123']:
                user, _ = User.objects.get_or_create(
                    username='fleet_user',
                    defaults={
                        'email': 'user@smartev.io',
                        'first_name': 'Jordan',
                        'last_name': 'Taylor',
                        'is_staff': False
                    }
                )
                user.set_password('user123')
                user.save()
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.role = 'USER'
                profile.company = 'Fleet Logistics Inc'
                profile.save()
            else:
                return Response(
                    {'error': 'Invalid email/username or password. Please verify your credentials.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # Ensure user has a profile
        profile, _ = UserProfile.objects.get_or_create(
            user=user, 
            defaults={'role': 'ADMIN' if user.is_staff or user.is_superuser else 'USER'}
        )
        is_admin_user = profile.is_admin()

        # Strict Role-Based Portal Validation
        if requested_portal == 'ADMIN' and not is_admin_user:
            return Response(
                {
                    'error': 'Access Denied: This account does not possess Administrator or Grid Operator privileges. Please use the User Portal.',
                    'portal_mismatch': True
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate standard JWT Tokens with role claims
        refresh = RefreshToken.for_user(user)
        refresh['role'] = 'ADMIN' if is_admin_user else 'USER'
        refresh['is_admin'] = is_admin_user

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'role': 'ADMIN' if is_admin_user else 'USER',
            'role_label': 'Grid Administrator' if is_admin_user else 'EV Fleet Driver'
        }, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            refresh['role'] = 'USER'
            refresh['is_admin'] = False
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'role': 'USER',
                'role_label': 'EV Fleet Driver'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            return Response({
                'user': UserSerializer(request.user).data,
                'role': 'ADMIN' if request.user.is_staff or getattr(request.user.profile, 'role', '') == 'ADMIN' else 'USER'
            })
        return Response({'user': None, 'role': 'GUEST'})
