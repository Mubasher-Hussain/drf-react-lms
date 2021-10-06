import json, datetime

import pytz

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.cache import never_cache
from django.views.generic import TemplateView
from django.utils import timezone

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from server.models import Book, Record, Request
from server.permissions import IsStaffOrReadOnly, IsStaff, IsStaffOrReaderOnly
from server.serializers import BooksSerializer, RecordSerializer, RequestSerializer

# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))


class BooksList(generics.ListCreateAPIView):
    """List all books, or create a new book"""
    permission_classes = [IsStaffOrReadOnly]
    queryset = Book.objects.all().order_by('title')
    serializer_class = BooksSerializer
    def get_queryset(self):
        """For displaying author specific posts if author is specified in url"""
        if self.kwargs:
            try:
                author = self.kwargs['author']
                return Book.objects.filter(author=author).order_by('title')
            except Book.DoesNotExist:
                print('Author not found')
        else:
            return Book.objects.all().order_by('title')


class BooksDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific Book"""
    permission_classes = [IsStaffOrReadOnly]
    queryset = Book.objects.all().order_by('title')
    serializer_class = BooksSerializer

class RecordList(generics.ListCreateAPIView):
    permission_classes = [IsStaffOrReaderOnly]
    queryset = Record.objects.all().order_by('reader')
    serializer_class = RecordSerializer
    def get_queryset(self):
        """For displaying records of specific reader if reader is specified in url"""
        if self.kwargs:
            try:
                reader = self.kwargs['reader']
                return Record.objects.filter(reader=reader).order_by('reader')
            except Record.DoesNotExist:
                print('Record not found')
        else:
            return Record.objects.all().order_by('reader')
    
    def perform_create(self, serializer):
        """When issue request is accepted, new record is created"""
        serializer.save()
        request = Request.objects.get(
            book=self.request.data['book'], 
            reader=self.request.data['reader'],
            status='pending')
        request.status='accepted'
        request.save()


class RecordDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific Record"""
    permission_classes = [IsStaffOrReaderOnly]
    queryset = Record.objects.all().order_by('reader')
    serializer_class = RecordSerializer

    def perform_update(self, serializer):
        """When book is returned, calculates fine if returned late more than 7 days"""
        record = self.get_object()
        if self.request.data['return_date'].endswith('Z'):
            return_date = datetime.datetime.fromisoformat(self.request.data['return_date'][:-1])
            aware_date = pytz.timezone('Asia/Karachi').localize(return_date)
        else:
            aware_date = datetime.datetime.fromisoformat(self.request.data['return_date'])
        issue_period = ((aware_date - record.issue_date).total_seconds() // 86400)
        fine = 0
        if issue_period >= 7:
            fine = (issue_period - 6) * 100
        serializer.save(fine=fine)


class RequestList(generics.ListCreateAPIView):
    queryset = Request.objects.all().order_by('reader')
    serializer_class = RequestSerializer
    permission_classes = [IsUniqueOrStaffOnly]
    def get_queryset(self):
        """For displaying requests of specific reader if reader is specified in url"""
        if self.kwargs:
            try:
                return Request.objects.filter(**self.kwargs).order_by('status')
            except Request.DoesNotExist:
                print('Reader not found')
        else:
            return Request.objects.all().order_by('reader')
    def perform_create(self, serializer):
        serializer.save(reader=self.request.user)


class RequestDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific Request"""
    permission_classes = [IsStaffOrReaderOnly]
    queryset = Request.objects.all().order_by('reader')
    serializer_class = RequestSerializer


def register_reader(request):
    """For registering of normal readers"""
    if request.method == 'POST':
        body = json.loads(request.body)
        try:
            user = User.objects.create_user(body['username'], body['email'], body['password'])
            return JsonResponse({'success': "Registered as normal User."})
        except:
            return JsonResponse({'error': "Username or Email already exists"})


def register_librarian(request):
    """For registering of staff"""
    if request.method == 'POST':
        body = json.loads(request.body)
        try:
            user = User.objects.create_user(body['username'], body['email'], body['password'])
            user.is_staff=True
            user.save()
            return JsonResponse({'success': "Registered as staff."})
        except:
            return JsonResponse({'error': "Username or Email already exists"})


@ensure_csrf_cookie
def login_request(request):
    if request.method == "POST":
        body = json.loads(request.body)
        user = authenticate(username=body['username'], password=body['password'])
        if user is not None:
            login(request, user)
            if user.is_staff:
                return JsonResponse({'Staff': 'Logged In'})
            else:
                return JsonResponse({'User': 'Logged In'})
        else:
            return JsonResponse({'error': "Invalid username or password."})       


def logout_request(request):
    logout(request)
    return JsonResponse({'Success': 'Logged Out'})
