from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from reservations.views import ReservationViewSet, DashboardDataView

# 🔧 Setup router for ViewSets
router = DefaultRouter()
router.register(r'reservations', ReservationViewSet, basename='reservation')

# 📚 Swagger/OpenAPI config
schema_view = get_schema_view(
    openapi.Info(
        title="Dinner Reservation API",
        default_version='v1',
        description="API documentation for your reservation system",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# ✅ Unified urlpatterns list
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),                    # Enables /api/reservations/<id>/
    path('api/reservations/', include('reservations.urls')),  # Avoids overlap with router URLs
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard-data/', DashboardDataView.as_view(), name='dashboard_data'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]