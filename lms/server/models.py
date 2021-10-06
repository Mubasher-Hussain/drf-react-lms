from django.contrib.auth.models import AbstractUser, User
from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=100, null=False, unique=True)
    summary = models.CharField(max_length=5000, null=False)
    author = models.CharField(max_length=100, null=False)
    published_on = models.DateField(null=True)

    def __str__(self):
        return self.title


class Request(models.Model):
    reader = models.ForeignKey(User, to_field='username', null=False, on_delete=models.DO_NOTHING)
    book = models.ForeignKey(Book, to_field='title', null=False, on_delete=models.DO_NOTHING)
    status = models.CharField(max_length=100, default='pending')

class Record(models.Model):
    reader = models.ForeignKey(User, to_field='username', null=False, on_delete=models.DO_NOTHING)
    book = models.ForeignKey(Book, to_field='title', null=False, on_delete=models.DO_NOTHING)
    issue_date = models.DateTimeField(auto_now_add=True)
    return_date = models.DateTimeField(null=True)
    fine = models.IntegerField(null=True)
