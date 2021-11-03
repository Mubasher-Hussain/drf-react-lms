import datetime
import pytz

from celery.schedules import crontab

from lms.celery import app
from lms.celery import task
from server.models import Record
from django.core.mail import send_mail
from django.db.models import F

@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    
    sender.add_periodic_task(
        crontab(minute=0, hour=0),
        notify.s(),
    )# Runs once every midnight

@task
def notify():
    """Emails users if deadline is in 2 days"""
    records = Record.objects.filter(return_date=None)
    for record in records:
        aware_date = pytz.timezone('Asia/Karachi').localize(datetime.datetime.now())
        tz = pytz.timezone('Asia/Karachi')
        aware_issue_date = record.issue_date.astimezone(tz)
        if aware_date.replace(hour=0, minute=0, second=0, microsecond=0) + datetime.timedelta(days=1) == aware_issue_date.replace(hour=0, minute=0, second=0, microsecond=0) + datetime.timedelta(days= record.issue_period_weeks*7):
            send_mail('Deadline Nearby', f"Deadline for your book {record.book} is 2 days away. Please return the book .", "mubasherhussain3293@gmail.com", [record.reader.email], fail_silently=True)
    

@task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
