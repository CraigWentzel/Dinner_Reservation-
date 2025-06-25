from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
User = get_user_model()

class Reservation(models.Model):
    guest = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name="reservations")
    date = models.DateField()
    time = models.TimeField()
    guests = models.IntegerField()
    special_request = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
