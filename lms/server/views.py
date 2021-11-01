import json, datetime

import pytz

from django.contrib.auth.models import User
from django.db.models import Sum, Count
from django.http import JsonResponse
from django.views.decorators.cache import never_cache
from django.views.generic import TemplateView
from django.utils import timezone

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from server.models import Book, Record, Request
from server.permissions import IsStaffOrReadOnly, IsStaffOrSelfReadOnly, IsStaffOrReaderOnly, IsUniqueOrStaffOnly, IsBookAvailable
from server.serializers import BooksSerializer, RecordSerializer, RequestSerializer, UserSerializer, MyTokenObtainPairSerializer

# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))


class ObtainTokenPairWithUserType(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class BooksList(generics.ListCreateAPIView):
    """List all books, or create a new book"""
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)
    queryset = Book.objects.all().order_by('title')
    serializer_class = BooksSerializer
    def get_queryset(self):
        """For displaying author specific posts if author is specified in url"""
        if self.kwargs:
            try:
                return Book.objects.filter(**self.kwargs).order_by('title')
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
    permission_classes = [IsStaffOrReaderOnly, IsBookAvailable]
    queryset = Record.objects.all().order_by('reader')
    serializer_class = RecordSerializer
    def get_queryset(self):
        """For displaying records of specific reader if reader is specified in url"""
        if self.kwargs:
            try:
                reader = self.kwargs['reader']
                return Record.objects.filter(reader=reader).order_by('return_date')
            except Record.DoesNotExist:
                print('Record not found')
        else:
            return Record.objects.all().order_by('return_date')

    def perform_create(self, serializer):
        """When issue request is accepted, new record is created"""
        serializer.save()
        book = Book.objects.get(title=self.request.data['book'])
        book.quantity -= 1
        book.save()
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
        if 'return_date' in self.request.data :
            record = self.get_object()
            book = Book.objects.get(title=record.book)
            book.quantity += 1
            book.save()
            fine_status = 'none'
            if self.request.data['return_date'].endswith('Z'):
                return_date = datetime.datetime.fromisoformat(self.request.data['return_date'][:-1])
                aware_date = pytz.timezone('Asia/Karachi').localize(return_date)
            else:
                aware_date = datetime.datetime.fromisoformat(self.request.data['return_date'])
            issue_period = ((aware_date - record.issue_date).total_seconds() // 86400)
            fine = 0
            request_period = record.issue_period_weeks  if record.issue_period_weeks else 1
            request_period *= 7
            if issue_period >= request_period:
                fine = (issue_period - 6) * 100
            if fine>0 :
                fine_status = 'pending'
            serializer.save(fine=fine, fine_status=fine_status)
        else:
            serializer.save(fine_status='paid')


class RequestList(generics.ListCreateAPIView):
    queryset = Request.objects.all().order_by('-status')
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
            return Request.objects.all().order_by('-status')
    def perform_create(self, serializer):
        serializer.save(reader=self.request.user)


class RequestDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific Request"""
    permission_classes = [IsStaffOrReaderOnly]
    queryset = Request.objects.all().order_by('reader')
    serializer_class = RequestSerializer


class UsersList(generics.ListAPIView):
    """Lists all users"""
    permission_classes = [IsStaffOrSelfReadOnly]
    queryset = User.objects.filter(is_staff=False).order_by('username')
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete user"""
    permission_classes = [IsStaffOrSelfReadOnly]
    queryset = User.objects.filter(is_staff=False).order_by('username')
    serializer_class = UserSerializer
    def retrieve(self, request, pk):
        """For adding fine for retreived user"""
        data = {}
        user_obj = self.get_object()
        user_serialized = self.serializer_class(user_obj)
        data['user'] = user_serialized.data
        overdue = user_obj.record_set.filter(fine_status='pending').aggregate(Sum('fine'))
        data['fine'] = overdue['fine__sum']
        return Response(data)


def get_categories(request):
    categories = list(Book.objects.all().values_list("category").distinct())
    return JsonResponse({'categories': categories})


def book_graph(request, reader=None):    
    output = {}
    if reader:
        data = Record.objects.filter(reader=reader).values('book').annotate(books_issued=Count('issue_date')).order_by('-books_issued')
    else:
        data = Record.objects.values('book').annotate(books_issued=Count('issue_date')).order_by('-books_issued')
    for obj in list(data):
        output[obj['book']] = obj['books_issued']
    return JsonResponse(output)


def stats(request, reader=None):    
    output = {}
    if reader:
        output['issue'] = Record.objects.filter(reader=reader, return_date= None).count()
        output['fine'] = Record.objects.filter(reader=reader).aggregate(Sum('fine'))['fine__sum']
    else:
        output['books'] = Book.objects.all().count()
        output['user'] = User.objects.filter(is_staff=False).count()
        output['issue'] = Record.objects.filter(return_date= None).count()
        output['fine'] = Record.objects.aggregate(Sum('fine'))['fine__sum']
    return JsonResponse(output)


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


def logout_request(request):
    body = json.loads(request.body)
    refresh_token = body["refresh_token"]
    token = RefreshToken(refresh_token)
    if refresh_token:
        token.blacklist()
    return JsonResponse({'Success': 'Logged Out'})
