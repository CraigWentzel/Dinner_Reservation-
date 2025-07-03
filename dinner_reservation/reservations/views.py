from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404

from .models import Reservation
from .serializers import ReservationSerializer
from reservations.utils.messaging import send_whatsapp


# 🔐 Custom JWT debug authentication
class DebugJWTAuth(JWTAuthentication):
    def authenticate(self, request):
        print("🔒 JWTAuth triggered!")
        return super().authenticate(request)


# 👨‍🍳 Staff-only permission check
class IsRestaurantStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


# 🔄 WhatsApp trigger helper
def send_whatsapp_message(reservation, template):
    if reservation.mobile_number and str(reservation.mobile_number).startswith("+"):
        send_whatsapp(to=reservation.mobile_number, message=template)
    else:
        print(f"⚠️ WhatsApp not sent — invalid or missing mobile for #{reservation.id}")


# 📊 Dashboard: grouped reservations by status
class DashboardDataView(APIView):
    permission_classes = [IsAuthenticated, IsRestaurantStaff]

    @swagger_auto_schema(
        operation_summary="Dashboard reservation grouping",
        operation_description="Returns categorized reservations for staff dashboards.",
        responses={
            200: openapi.Response(
                description="Grouped reservation data",
                schema=openapi.Schema(type=openapi.TYPE_OBJECT)
            ),
            401: "Unauthorized",
            403: "Forbidden – staff only"
        },
        tags=["Dashboard"]
    )
    def get(self, request):
        grouped = {
            status: Reservation.objects.filter(status__iexact=status)
            for status in ["pending", "approved", "reschedule_requested", "cancelled"]
        }
        return Response({k: ReservationSerializer(v, many=True).data for k, v in grouped.items()})


# 📆 Reservation creation (guests)
class ReservationCreateView(generics.CreateAPIView):
    authentication_classes = [DebugJWTAuth]
    permission_classes = [IsAuthenticated]
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    @swagger_auto_schema(
        operation_summary="Create a reservation",
        operation_description="Authenticated guests create a reservation.",
        responses={201: ReservationSerializer, 400: "Bad request", 401: "Unauthorized"},
        tags=["Reservations"]
    )
    def post(self, request, *args, **kwargs):
        print("🧪 Auth Header:", request.META.get("HTTP_AUTHORIZATION"))
        return super().post(request, *args, **kwargs)


# 📦 Reservation management (guests + staff)
class ReservationViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    def get_queryset(self):
        user = self.request.user
        return self.queryset if user.is_staff else self.queryset.filter(guest=user)

    def perform_create(self, serializer):
        reservation = serializer.save(guest=self.request.user)
        print("🎉 Reservation created:", reservation.id)

    def perform_update(self, serializer):
        reservation = serializer.save()
        print(f"🚨 Updated reservation #{reservation.id} → Status: {reservation.status}")

        # ✉️ Email logic
        if reservation.status == "approved" and reservation.email:
            send_mail(
                "Your Reservation Is Confirmed!",
                f"Hi {reservation.first_name}, your reservation for {reservation.date} at {reservation.time} has been approved.",
                "noreply@yourrestaurant.com",
                [reservation.email],
            )

        # 📱 WhatsApp logic
        if reservation.status == "approved":
            if reservation.guest_confirmed:
                send_whatsapp_message(
                    reservation,
                    f"Hi {reservation.first_name}, thanks for confirming. Your updated reservation for {reservation.date} at {reservation.time} is now locked in. See you soon!"
                )
            else:
                send_whatsapp_message(
                    reservation,
                    f"Hi {reservation.first_name}, your reservation for {reservation.date} at {reservation.time} is confirmed. We look forward to hosting you!"
                )
        elif reservation.status == "reschedule_requested" and reservation.proposed_date and reservation.proposed_time:
            send_whatsapp_message(
                reservation,
                f"We’d like to reschedule your reservation to {reservation.proposed_date} at {reservation.proposed_time}. Let us know if that works."
            )
        elif reservation.status == "cancelled":
            send_whatsapp_message(
                reservation,
                "We're sorry, but your reservation has been cancelled. If this was a mistake, feel free to book again anytime."
            )

    # ✅ Guest confirms reschedule
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    @swagger_auto_schema(
        operation_summary="Guest confirms a rescheduled reservation",
        operation_description="Guests confirm a proposed date/time.",
        responses={
            200: "Reschedule confirmed",
            403: "Forbidden – guest mismatch",
            404: "Not found"
        },
        tags=["Reservations"]
    )
    def confirm_reschedule(self, request, pk=None):
        reservation = self.get_object()

        if reservation.guest != request.user:
            return Response({"error": "Not authorized to confirm this reservation"}, status=status.HTTP_403_FORBIDDEN)

        reservation.guest_confirmed = True
        reservation.status = "approved"
        reservation.save()

        send_whatsapp_message(
            reservation,
            f"Hi {reservation.first_name}, thanks for confirming. Your updated reservation for {reservation.date} at {reservation.time} is now locked in. See you soon!"
        )

        return Response({"message": "Reschedule confirmed"}, status=status.HTTP_200_OK)