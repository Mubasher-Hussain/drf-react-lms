import datetime
import json

from django.contrib import auth
from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.utils import timezone

from rest_framework.test import APIClient

from .models import Book, Record, Request

class PermissionTest(TestCase):
    """Each test is independant and database is empty for each test"""
    def setUp(self):
        """Client for each tests."""
        self.client = APIClient()

    def test_books_create_permission(self):
        User.objects.create_user(username='mhussain', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        response_staff = self.client.post('/server/api/books/create', {'summary': 'tent', 'title': 'builder', 'author': 'mhussain'})
        
        User.objects.create_user(username='mhussain2', password='123')
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain2', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        response_user = self.client.post('/server/api/books/create', {'summary': 'tent', 'title': 'builder2', 'author': 'mhussain'})
        
        self.assertEqual(response_staff.status_code, 201)
        self.assertEqual(response_user.status_code, 403)
        
    def test_books_delete_permission(self):
        """Only Staff can delete book"""
        User.objects.create_user(username='mhussain2', password='123')
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain2', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        book_user = Book.objects.create(id=1234, title='titled2', summary='summary123')
        response_user = self.client.delete('/server/api/book/1234/delete')
        
        User.objects.create_user(username='mhussain', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        book_staff = Book.objects.create(id=123, title='titled', summary='summary123')
        response_staff = self.client.delete('/server/api/book/123/delete')
        
        # Also confirms if book is deleted
        self.assertEqual(response_staff.status_code, 204)
        self.assertFalse(book_staff in Book.objects.all())
        
        self.assertEqual(response_user.status_code, 403)
        self.assertTrue(book_user in Book.objects.all())
    
    def test_books_edit_permission(self):
        """Only staff can edit books"""
        User.objects.create_user(username='mhussain', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        Book.objects.create(id=123, title='titled', summary='summary123', author='mhussain')
        data= {'title': 'editedTitle', 'summary': 'editsummary', 'author': 'mhussain'}
        response_staff = self.client.put('/server/api/book/123/edit', data)
        
        User.objects.create_user(username='mhussain2', password='123')
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain2', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        data= {'title': 'editedTitle2', 'summary': 'editsummary', 'author': 'mhussain'}
        response_user = self.client.put('/server/api/book/123/edit', data)
        # Matches returned query with edited title and summary
        self.assertEqual(response_staff.status_code, 200)
        self.assertEqual(response_staff.json()['title'], 'editedTitle')
        self.assertEqual(response_staff.json()['summary'], 'editsummary')
        self.assertEqual(response_staff.json()['author'], 'mhussain')

        self.assertEqual(response_user.status_code, 403)

    def test_issue_record_permission(self):
        """Only staff can issue book to users by creating record"""
        user = User.objects.create_user(username='mhussain', password='123')
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        self.client.post('/server/api/requests/create', {'book': 'book1'})
        response_user = self.client.post('/server/api/records/create', {'book': 'book1', 'reader': 'mhussain'})
        
        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mubashir', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        response_staff = self.client.post('/server/api/records/create', {'book': 'book1', 'reader': 'mhussain'})
        
        self.assertEqual(response_staff.status_code, 201)
        self.assertEqual(response_user.status_code, 403)
        
    def test_return_book_record_permission(self):
        """Only Staff can return book by editing record return date"""
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        Request.objects.create(book=book, reader=auth.get_user(self.client))
        Record.objects.create(book=book, reader=user)
        time = timezone.localtime(timezone.now() + datetime.timedelta(days=8, milliseconds=100))
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        # Normal user tries to return own book which only staff has permission
        response_user = self.client.patch('/server/api/record/1/return-book', {'return_date': time})
        
        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mubashir', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        response_staff = self.client.patch('/server/api/record/1/return-book', {'return_date': time})
        
        self.assertEqual(response_staff.status_code, 200)
        self.assertEqual(response_user.status_code, 403)

    def test_record_access_permission(self):
        """Normal Users can only access their own records. Staff can access any record"""
        user1 = User.objects.create_user(username='mhussain', password='123')
        user2 = User.objects.create_user(username='mhussain2', password='123')
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        
        self.client.login(username='mhussain', password='123')
        Request.objects.create(book=book, reader=auth.get_user(self.client))
        Record.objects.create(id=1, book=book, reader=user1)
        
        self.client.login(username='mhussain2', password='123')
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain2', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        Request.objects.create(book=book, reader=auth.get_user(self.client))
        Record.objects.create(id=2, book=book, reader=user2)
        
        # Normal User accessing own records and tries other user records
        response_all_records_user = self.client.get('/server/api/records')
        response_all_self_records_user = self.client.get('/server/api/mhussain2/records')
        response_all_other_records_user = self.client.get('/server/api/mhussain/records')
        response_specific_own_record_user = self.client.get('/server/api/record/2')
        response_specific_other_record_user = self.client.get('/server/api/record/1')

        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mubashir', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        # Staff accessing all records
        response_all_records_staff = self.client.get('/server/api/records')
        response_user_records_staff = self.client.get('/server/api/mhussain2/records')
        response_specific_record_user = self.client.get('/server/api/record/2')
        
        self.assertEqual(response_all_records_staff.status_code, 200)
        self.assertEqual(response_user_records_staff.status_code, 200)
        self.assertEqual(response_specific_record_user.status_code, 200)

        self.assertEqual(response_all_records_user.status_code, 403)
        self.assertEqual(response_all_self_records_user.status_code, 200)
        self.assertEqual(response_all_other_records_user.status_code, 403)
        self.assertEqual(response_specific_own_record_user.status_code, 200)
        self.assertEqual(response_specific_other_record_user.status_code, 403)
    
    def test_request_create_permission(self):
        """Pending request for a user must be unique for books"""
        user = User.objects.create_user(username='mhussain', password='123')
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        Book.objects.create(id=123, title='book1', summary='summary123')
        Book.objects.create(id=1234, title='book2', summary='summary123')
        response1 = self.client.post('/server/api/requests/create', {'book': 'book1'})
        response2 = self.client.post('/server/api/requests/create', {'book': 'book2'})
        response1_duplicate = self.client.post('/server/api/requests/create', {'book': 'book1'})
        
        self.assertEqual(response1.status_code, 201)
        self.assertEqual(response2.status_code, 201)
        self.assertEqual(response1_duplicate.status_code, 403)
    
    def test_request_edit_permission(self):
        """Only Staff can edit requests"""
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        Request.objects.create(id=1234, book=book, reader=auth.get_user(self.client))
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        response_user = self.client.patch('/server/api/request/1234/edit', {'status': 'accepted'})

        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mubashir', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        response_staff = self.client.patch('/server/api/request/1234/edit', {'status': 'accepted'})

        self.assertEqual(response_staff.status_code, 200)
        self.assertEqual(response_user.status_code, 403)
    
    def test_request_access_permission(self):
        """Normal Users can only access their own requests. Staff can access any request"""
        user1 = User.objects.create_user(username='mhussain', password='123')
        user2 = User.objects.create_user(username='mhussain2', password='123')
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        
        self.client.login(username='mhussain', password='123')
        Request.objects.create(book=book, reader=auth.get_user(self.client))
        
        self.client.login(username='mhussain2', password='123')
        Request.objects.create(book=book, reader=auth.get_user(self.client))
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain2', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        # Normal User accessing own requests and tries other user requests
        response_all_requests_user = self.client.get('/server/api/requests')
        response_all_self_requests_user = self.client.get('/server/api/mhussain2/requests')
        response_all_other_requests_user = self.client.get('/server/api/mhussain/requests')
        response_specific_own_request_user = self.client.get('/server/api/request/2')
        response_specific_other_request_user = self.client.get('/server/api/request/1')

        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mubashir', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        # Staff accessing all requests
        response_all_requests_staff = self.client.get('/server/api/requests')
        response_user_requests_staff = self.client.get('/server/api/mhussain2/requests')
        response_specific_request_user = self.client.get('/server/api/request/2')
        
        self.assertEqual(response_all_requests_staff.status_code, 200)
        self.assertEqual(response_user_requests_staff.status_code, 200)
        self.assertEqual(response_specific_request_user.status_code, 200)

        self.assertEqual(response_all_requests_user.status_code, 403)
        self.assertEqual(response_all_self_requests_user.status_code, 200)
        self.assertEqual(response_all_other_requests_user.status_code, 403)
        self.assertEqual(response_specific_own_request_user.status_code, 200)
        self.assertEqual(response_specific_other_request_user.status_code, 403)
    
    def test_user_access_permission(self):
        """Users can only view themselves while Staff has all access"""
        user1 = User.objects.create_user(id=1, username='mhussain', password='123')
        user2 = User.objects.create_user(id=2, username='mhussain2', password='123')
        
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        # Normal User accessing Users info
        response_access_users_user = self.client.get('/server/api/users')
        response_access_self_user = self.client.get('/server/api/user/1')
        response_access_other_user = self.client.get('/server/api/user/2')
        
        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mubashir', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        # Staff accessing all users
        response_access_users_staff = self.client.get('/server/api/users')
        response_access_id_staff = self.client.get('/server/api/user/2')
        
        self.assertEqual(response_access_users_staff.status_code, 200)
        self.assertEqual(response_access_id_staff.status_code, 200)

        self.assertEqual(response_access_users_user.status_code, 403)
        self.assertEqual(response_access_other_user.status_code, 403)
        self.assertEqual(response_access_self_user.status_code, 200)

    def test_user_edit_permission(self):
        """Only Staff can edit Users"""
        user1 = User.objects.create_user(id=1, username='mhussain', password='123')
        user2 = User.objects.create_user(id=2, username='mhussain2', password='123')
        
        token = self.client.post('/server/api/token/obtain/', {'username':'mhussain', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        # Normal User editing info
        response_user = self.client.patch('/server/api/user/1/edit', {'email': 'a@b.com'})
       
        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        token = self.client.post('/server/api/token/obtain/', {'username':'mubashir', 'password':'123'})
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + token.data['access'])
        
        # Staff editing user info
        response_staff = self.client.patch('/server/api/user/1/edit', {'email': 'a@c.com'})

        self.assertEqual(response_staff.status_code, 200)
        self.assertEqual(response_user.status_code, 403)
 