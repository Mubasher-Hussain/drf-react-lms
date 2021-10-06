import datetime
import json

from django.contrib import auth
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.utils import timezone

from .models import Book, Record, Request

class ViewsTest(TestCase):
    """Each test is independant and database is empty for each test"""
    def setUp(self):
        """Client for each tests."""
        self.client = Client()

    def test_books_list(self):
        """Creates User and its two books and retrieve them."""
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        Book.objects.create(title='title', summary='Con')
        Book.objects.create(title='builder', summary='tent')

        response = self.client.get('/server/api/books')

        # Check response status, no of books returned and matches title and summary.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]['title'], 'builder')
        self.assertEqual(response.json()[0]['summary'], 'tent')

    def test_books_list_author(self):
        """Creates books for two users and retrieves them by author for each user"""
        user1 = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        Book.objects.create(title='body', summary='Con', author='mhussain')
        Book.objects.create(title='body2', summary='Con2', author='mhussain')

        Book.objects.create(title='builder', summary='tent', author='mubashir')
        Book.objects.create(title='builder2', summary='tent2', author='mubashir')
        
        response1 = self.client.get('/server/api/mhussain/books')
        response2 = self.client.get('/server/api/mubashir/books')
        
        # Checks response statuses and confirms author matches.
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(len(response1.json()), 2)
        self.assertEqual(response1.json()[0]['author'], 'mhussain')
        self.assertEqual(response1.json()[1]['author'], 'mhussain')
        
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(len(response2.json()), 2)
        self.assertEqual(response2.json()[0]['author'], 'mubashir')
        self.assertEqual(response2.json()[1]['author'], 'mubashir')

    def test_books_create(self):
        user = User.objects.create_user(username='mhussain', password='123', is_staff=True)
        self.client.login(username='mhussain', password='123')
        response = self.client.post('/server/api/books/create', {'summary': 'tent', 'title': 'builder', 'author': 'mhussain'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['title'], 'builder')
        self.assertEqual(response.json()['summary'], 'tent')
        self.assertEqual(response.json()['author'], 'mhussain')

    def test_books_delete(self):
        user = User.objects.create_user(username='mhussain', password='123', is_staff=True)
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(id=123, title='titled', summary='summary123')
        response = self.client.delete('/server/api/book/123/delete')
        # Also confirms if book is deleted
        self.assertEqual(response.status_code, 204)
        self.assertFalse(book in Book.objects.all())
    
    def test_books_edit(self):
        user = User.objects.create_user(username='mhussain', password='123', is_staff=True)
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(id=123, title='titled', summary='summary123', author='mhussain')
        data= {'title': 'editedTitle', 'summary': 'editsummary', 'author': 'mhussain'}
        response = self.client.put('/server/api/book/123/edit', data, content_type='application/json')
        # Matches returned query with edited title and summary
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['title'], 'editedTitle')
        self.assertEqual(response.json()['summary'], 'editsummary')
        self.assertEqual(response.json()['author'], 'mhussain')

    def test_signup(self):
        data = {'username': 'mhussain', 'email': 'abcd@b.com', 'password': '1234567'}
        response = self.client.generic('POST', '/server/api/register/reader/' , json.dumps(data))
        user = User.objects.get(username='mhussain')
        
        # Confirms if user is in system by checking its email
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(user.email, 'abcd@b.com')

    def test_login(self):
        User.objects.create_user(username='mhussain', email='abc@d.com', password= '1234567', is_staff=True)
        data = {'username': 'mhussain', 'password': '1234567'}
        response = self.client.generic('POST', '/server/api/login/', json.dumps(data))
        user = auth.get_user(self.client)
        
        # Confirms login by checking if client user is authenticated
        self.assertTrue(user.is_authenticated)
        self.assertTrue(user.is_staff)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['Staff'])

    def test_logout(self):
        User.objects.create_user(username='mhussain', email='abc@d.com', password= '1234567')
        self.client.login(username='mhussain', password='123')
        response = self.client.get('/server/api/logout/')
        user = auth.get_user(self.client)
        
        # Confirms logout if client user is not authenticated
        self.assertFalse(user.is_authenticated)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['Success'])

    def test_book_detail(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(title='titled', summary='summary123', author='auth1')
        response = self.client.get('/server/api/book/1')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['title'], 'titled')
    
    def test_request_create(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        response = self.client.post('/server/api/requests/create', {'book': 'book1'})
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['reader'], 'mhussain')
        self.assertEqual(response.json()['book'], 'book1')
        self.assertEqual(response.json()['status'], 'pending')
    
    def test_issue_book(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        self.client.post('/server/api/requests/create', {'book': 'book1'})
        
        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        self.client.login(username='mubashir', password='123')
        
        response = self.client.post('/server/api/records/create', {'book': 'book1', 'reader': 'mhussain'})
        self.client.login(username='mhussain', password='123')
        response2 = self.client.get('/server/api/request/1')
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['reader'], 'mhussain')
        self.assertEqual(response.json()['book'], 'book1')
        self.assertFalse(response.json()['return_date'])
        self.assertEqual(response2.json()['status'], 'accepted')
    
    def test_issue_book_permission(self):
    
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        self.client.post('/server/api/requests/create', {'book': 'book1'})
        
        response = self.client.post('/server/api/records/create', {'book': 'book1', 'reader': 'mhussain'})
        
        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        self.client.login(username='mubashir', password='123')
        
        response2 = self.client.post('/server/api/records/create', {'book': 'book1', 'reader': 'mhussain'})
        
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response2.status_code, 201)

    def test_return_book_check_fine(self):
        user = User.objects.create_user(username='mhussain', password='123')
        self.client.login(username='mhussain', password='123')
        book = Book.objects.create(id=123, title='book1', summary='summary123')
        Request.objects.create(book=book, reader=auth.get_user(self.client))
        
        staff = User.objects.create_user(username='mubashir', password='123', is_staff=True)
        self.client.login(username='mubashir', password='123')
        
        Record.objects.create(book=book, reader=user)
        
        time = timezone.localtime(timezone.now() + datetime.timedelta(days=8, milliseconds=100))
        response1 = self.client.patch('/server/api/record/1/return-book', {'return_date': time}, content_type='application/json')
        
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response1.json()['reader'], 'mhussain')
        self.assertEqual(response1.json()['book'], 'book1')
        self.assertTrue(response1.json()['return_date'])
        self.assertEqual(response1.json()['fine'], 200)
