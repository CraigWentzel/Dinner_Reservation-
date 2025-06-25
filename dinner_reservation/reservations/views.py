from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Reservation
from .serializers import ReservationSerializer

class ReservationCreateView(generics.CreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):  
        try:
            print("User:", self.request.user)
            print("Is authenticated:", self.request.user.is_authenticated)
            print("Validated data:", serializer.validated_data)
            reservation = serializer.save(guest=self.request.user)
            print("Reservation saved:", reservation)
        except Exception as e:
            import traceback
            print("Reservation save failed:", e)
            traceback.print_exc()
            raise