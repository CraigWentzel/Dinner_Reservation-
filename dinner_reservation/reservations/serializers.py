from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(source="guest.username", read_only=True)
    guest = serializers.PrimaryKeyRelatedField(read_only=True)  # 👈 Add this line

    class Meta:
        model = Reservation
        fields = [
            'id',
            'guest_name',
            'guest',  # 👈 Must be included here
            "first_name",
            "last_name",
            "email",
            "mobile_number",
            'date',
            'time',
            'guests',
            'special_request',
            'status',
            'proposed_date',
            
            'proposed_time',
            'guest_confirmed',

            'created_at',
        ]