from django.urls import path
from .views import ReservationCreateView, DashboardDataView

urlpatterns = [
    path('reservations/', ReservationCreateView.as_view(), name='reservation-create'),
    path('dashboard-data/', DashboardDataView.as_view(), name='dashboard-data'),

]