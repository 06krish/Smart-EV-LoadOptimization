from django.urls import path
from .views import LoginView, RegisterView, CurrentUserView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth_login'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
]
