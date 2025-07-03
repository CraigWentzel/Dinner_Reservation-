from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta

User = get_user_model()

class Reservation(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("cancelled", "Cancelled"),
        ("reschedule_requested", "Reschedule Requested"),
    ]

    guest = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservations", null=True, blank=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    mobile_number = models.CharField(max_length=20, null=True, blank=True)
    date = models.DateField()
    time = models.TimeField()
    guests = models.IntegerField()
    special_request = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(default=timezone.now)
    proposed_date = models.DateField(null=True, blank=True)
    proposed_time = models.TimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_fee_due = models.BooleanField(default=False)
    guest_confirmed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.status == "cancelled" and not self.cancelled_at:
            self.cancelled_at = timezone.now()

            if self.date and self.time:
                scheduled_dt = timezone.make_aware(datetime.combine(self.date, self.time))
                if scheduled_dt - timezone.now() < timedelta(hours=24):
                    self.cancellation_fee_due = True
        super().save(*args, **kwargs)
        
   
