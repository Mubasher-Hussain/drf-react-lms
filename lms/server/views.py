import datetime
import json
import pytz
import redis

from asgiref.sync import AsyncToSync
from channels.layers import get_channel_layer

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator, PasswordResetTokenGenerator
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import send_mail, EmailMultiAlternatives
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncDate
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.template.loader import render_to_string, get_template
from django.template import Context
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.views.decorators.cache import never_cache
from django.views.generic import TemplateView

from rest_framework import generics, permissions, filters
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from server.models import Book, Record, Request, Author, Rating
from server.permissions import IsStaffOrReadOnly, IsStaffOrSelfReadOnly, IsStaffOrReaderOnly, IsUniqueOrStaffOnly, IsBookAvailable, IsAdmin
from server.serializers import BooksSerializer, RecordSerializer, RequestSerializer, UserSerializer, MyTokenObtainPairSerializer, AuthorSerializer, RatingSerializer


# Serve Single Page Application
index = never_cache(TemplateView.as_view(template_name='index.html'))
redis_instance = redis.StrictRedis(host=settings.REDIS_HOST,
                                  port=settings.REDIS_PORT, encoding="utf-8", decode_responses=True, db=0)


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    def get_paginated_response(self, data):
        response = super(CustomPagination, self).get_paginated_response(data)
        response.data['total_pages'] = self.page.paginator.num_pages
        return response


class ObtainTokenPairWithUserType(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class BooksList(generics.ListCreateAPIView):
    """List all books, or create a new book"""
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = BooksSerializer
    queryset = Book.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['title', 'id', 'author', 'category', 'quantity', 'published_on']
    search_fields = ['id','title', 'author__name', 'category', 'published_on']
    pagination_class = CustomPagination
    def get_queryset(self):
        """For displaying author specific posts if author is specified in url"""
        query_parameters  = self.request.query_params
        book_queryset = Book.objects.all().order_by('title')
            
        if self.kwargs:
            try:
                book_queryset = Book.objects.filter(**self.kwargs).order_by('title')
            except Book.DoesNotExist:
                print('Author not found')
        if 'ordering' in query_parameters and 'avg_rating' in query_parameters.get('ordering'):
            return book_queryset.annotate(avg_ratings=Avg('rating__rating')).order_by(query_parameters.get('ordering')+'s')
        return book_queryset


class BooksDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific Book"""
    permission_classes = [IsStaffOrReadOnly]
    queryset = Book.objects.all().order_by('title')
    serializer_class = BooksSerializer
    def retrieve(self, request, pk):
        """For adding fine for retreived user"""
        data = {}
        book_obj = self.get_object()
        book_serialized = self.serializer_class(book_obj)
        data['book'] = book_serialized.data
        try:
            data['user_rating'] = self.request.user.rating_set.all().get(book=book_obj).rating
        except:
            data['user_rating'] = None
        return Response(data)


class RecordList(generics.ListCreateAPIView):
    permission_classes = [IsStaffOrReaderOnly, IsBookAvailable]
    queryset = Record.objects.all().order_by('reader')
    serializer_class = RecordSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['book__title', 'reader__username', 'fine_status', 'issue_date', 'return_date', 'fine']
    search_fields = [ 'id', 'reader__username', 'fine_status', 'book__title', 'issue_date', 'return_date', 'fine']
    pagination_class = CustomPagination
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
        send_push_notification(f"You have been issued book {self.request.data['book']} for {self.request.data['issue_period_weeks']} weeks.", request.reader.username)
        send_mail('Book Issued', f"You have been issued book {self.request.data['book']} for {self.request.data['issue_period_weeks']} weeks.", settings.DEFAULT_FROM_EMAIL, [User.objects.get(username=self.request.data['reader']).email], fail_silently=True)


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
            fine_message = ''
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
                fine_message += f"with fine {fine} for late returning"
            serializer.save(fine=fine, fine_status=fine_status)
            send_push_notification(f"Your book {record.book} is returned successfully {fine_message}", record.reader.username)
            send_mail('Book Returned', f"Your book {record.book} is returned successfully {fine_message}", settings.DEFAULT_FROM_EMAIL, [record.reader.email], fail_silently=True)
        else:
            record = self.get_object()
            send_push_notification(f"Your fine {record.fine} is paid successfully for overdue book {record.book} .", record.reader.username)
            send_mail('Fine Paid', f"Your fine {record.fine} is paid successfully for overdue book {record.book} .", settings.DEFAULT_FROM_EMAIL, [record.reader.email], fail_silently=True)
            serializer.save(fine_status='paid')


class RequestList(generics.ListCreateAPIView):
    queryset = Request.objects.all().order_by('-status')
    serializer_class = RequestSerializer
    permission_classes = [IsUniqueOrStaffOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['book__title', 'reader__username', 'book__quantity', 'issue_period_weeks', 'status']
    search_fields = [ 'reader__username', 'status', 'book__title']
    pagination_class = CustomPagination
    
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
        send_mail('Request Created', f"Your request to issue book {self.request.data['book']} is created. Check your requests list to see your progress.", settings.DEFAULT_FROM_EMAIL, [self.request.user.email], fail_silently=True)


class RequestDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific Rating"""
    permission_classes = [IsStaffOrReaderOnly]
    queryset = Request.objects.all().order_by('reader')
    serializer_class = RequestSerializer
    def perform_update(self, serializer):
        request = self.get_object()
        if self.request.data['status'] == 'rejected' :
            send_push_notification(f"Your request to issue book {request.book} is rejected.", request.reader.username)
        serializer.save()


class RatingList(generics.ListCreateAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    def perform_create(self, serializer):
        serializer.save(reader=self.request.user)    


class RatingChange(APIView):
    def post(self, request):
        data = request.data
        rating = Rating.objects.get(reader=self.request.user, book=Book.objects.get(title=data['book']))
        rating.rating = data['rating']
        rating.save()
        return Response()


class AuthorList(generics.ListAPIView):
    """Lists all authors"""
    permission_classes = [IsStaffOrReadOnly]
    queryset = Author.objects.all().order_by('name')
    serializer_class = AuthorSerializer
   

class UsersList(generics.ListAPIView):
    """Lists all users"""
    permission_classes = [IsStaffOrSelfReadOnly]
    queryset = User.objects.filter(is_staff=False).order_by('username')
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']
    pagination_class = CustomPagination



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


class RegisterLibrarian(APIView):
    permission_classes = [IsAdmin]
    def post(self, request):
        body = request.data
        try:
            user = User.objects.create_user(body['username'], body['email'])
            user.is_staff = True
            user.is_active = False
            user.save()
            current_site = get_current_site(request)
            mail_subject = 'Activate your account.'
            message = render_to_string('staff_activation.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            })
            send_mail(mail_subject, '', 'mubasherhussain3293@gmail.com', [body['email']], html_message=message)
            return JsonResponse({'success': "Staff Added."})
        except:
            return JsonResponse({'error': "Username or Email already exists"})


@api_view(['GET'])
def get_categories(request):
    categories = list(Book.objects.all().values_list("category").distinct())
    return JsonResponse({'categories': categories})


@api_view(['GET'])
def book_graph(request, reader=None):    
    book_issued_count = []
    book_issued_daily = []
    filter = ''
    
    if (request.query_params.get('date')):
        filter = request.query_params.get('date')[:-3]
    
    if reader:
        record_daily = Record.objects.filter(reader=reader).annotate(issue_date_only = TruncDate('issue_date')).values('issue_date_only').annotate(books_issued=Count('issue_date_only'))[:5]
        data = Record.objects.filter(reader=reader, issue_date__icontains=filter).values('book').annotate(books_issued=Count('issue_date')).order_by('-books_issued')
    else:
        record_daily = Record.objects.all().annotate(issue_date_only = TruncDate('issue_date')).values('issue_date_only').annotate(books_issued=Count('issue_date_only'))[:5]
        data = Record.objects.filter(issue_date__icontains=filter).values('book').annotate(books_issued=Count('issue_date'), avg_ratings=Avg('book__rating__rating')).order_by('-books_issued')[:5]
    
    for obj in list(data):
        book_issued_count.append({'argument': obj['book'], 'value': obj['books_issued']})

    for obj in list(record_daily):
        book_issued_daily.append({'argument': obj['issue_date_only'].strftime('%Y-%m-%d'), 'value': obj['books_issued']})

    popular_books = Book.objects.all().annotate(avg_ratings=Avg('rating__rating')).order_by('-avg_ratings')[:5]
    popular_books = BooksSerializer(popular_books, many=True).data
    return JsonResponse({'book_issued_count': book_issued_count, 'popular_books': popular_books, 'book_issued_daily': book_issued_daily})


@api_view(['GET'])
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
    body = json.loads(request.body)
    try:
        user = User.objects.create_user(body['username'], body['email'], body['password'])
        user.is_active = False
        user.save()
        current_site = get_current_site(request)
        mail_subject = 'Activate your account.'
        message = render_to_string('acc_activation.html', {
            'user': user,
            'domain': current_site.domain,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
        })
        send_mail(mail_subject, '', 'mubasherhussain3293@gmail.com', [body['email']], fail_silently=True, html_message=message)
        return JsonResponse({'success': "Registered as normal User. Please activate your account from link in you mail"})
    except Exception as e:
        print(e)
        return JsonResponse({'error': "Username or Email already exists"})


def activate(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        send_mail('Account Activated', 'Your account is activated.', 'mubasherhussain3293@gmail.com', [user.email], fail_silently=True)
        return HttpResponse('Thank you for your email confirmation. Now you can login your account.')
    else:
        return HttpResponse('Activation link is invalid!')


def set_password(request):
    body = json.loads(request.body)
    try:
        uid = urlsafe_base64_decode(body['uid']).decode()
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, body['token']):
        user.set_password(body['password'])
        user.is_active = True
        user.save()
        send_mail('Account Activated', 'Your account is activated.', 'mubasherhussain3293@gmail.com', [user.email], fail_silently=True)
        return HttpResponse('Thank you for your email confirmation. Now you can login your account.')
    else:
        return HttpResponse('Activation link is invalid!')

@api_view(['POST'])
def logout_request(request):
    body = json.loads(request.body)
    refresh_token = body["refresh_token"]
    try:
        token = RefreshToken(refresh_token)
        redis_instance.delete(request.user.username)
    except:
        return JsonResponse({'Success': 'Logged Out'})    
    if refresh_token:
        token.blacklist()
    return JsonResponse({'Success': 'Logged Out'})


@api_view(['POST'])
def print_channel(request):
    body = json.loads(request.body)
    message = body['message']
    recipient = body['recipient']
    if send_push_notification(message, recipient):    
        return JsonResponse({'success': 'success'})
    return JsonResponse({'error': 'The recipient is not online'})    


def send_push_notification(message, recipient):
    try:
        channel_layer = get_channel_layer()
        channel = redis_instance.get(recipient)
        AsyncToSync(channel_layer.send)(channel, {
            "type": "notify.user",
            "text": message,
        })
        return True
    except:
        return False
