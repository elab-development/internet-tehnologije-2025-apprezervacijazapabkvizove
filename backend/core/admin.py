from django.contrib import admin
from .models import Table, Quiz, Reservation, EmailLog, ActivityLog, UserProfile

admin.site.register(Table)
admin.site.register(Quiz)
admin.site.register(Reservation)
admin.site.register(EmailLog)
admin.site.register(ActivityLog)
admin.site.register(UserProfile)



