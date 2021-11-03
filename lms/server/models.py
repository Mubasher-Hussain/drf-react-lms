from django.contrib.auth.models import User
from django.db import models
from asgiref.sync import sync_to_async

class Book(models.Model):
    cover = models.ImageField(upload_to='book_cover/%Y/%m/%d', blank=True, null=True)
    title = models.CharField(max_length=100, null=False, unique=True)
    summary = models.CharField(max_length=5000, null=False)
    author = models.CharField(max_length=100, null=False)
    published_on = models.DateField(null=True)
    category = models.CharField(max_length=100, default='Unassigned', null=False)
    quantity = models.IntegerField(default=1)
    def __str__(self):
        return self.title


class Request(models.Model):
    reader = models.ForeignKey(User, to_field='username', null=False, on_delete=models.DO_NOTHING)
    book = models.ForeignKey(Book, to_field='title', null=False, on_delete=models.DO_NOTHING)
    status = models.CharField(max_length=100, default='pending')
    issue_period_weeks = models.IntegerField(default=1)
    
    
class Record(models.Model):
    reader = models.ForeignKey(User, to_field='username', null=False, on_delete=models.DO_NOTHING)
    book = models.ForeignKey(Book, to_field='title', null=False, on_delete=models.DO_NOTHING)
    issue_date = models.DateTimeField(auto_now_add=True)
    return_date = models.DateTimeField(null=True)
    fine = models.IntegerField(null=True)
    issue_period_weeks = models.IntegerField(default=1)
    fine_status = models.CharField(max_length=100, default='none')


class Address(models.Model):
    reader = models.ForeignKey(User, to_field='username', null=False, on_delete=models.CASCADE)
    channel_name = models.CharField(max_length=300)
    
    @classmethod
    @sync_to_async
    def create(self, channel_name, user):
        address = self.objects.filter(reader=user).delete()
        address = self.objects.create(reader=user, channel_name=channel_name)
        return address

    @classmethod
    @sync_to_async
    def delete(self, channel_name):
        address = self.objects.filter(channel_name=channel_name).delete()
        