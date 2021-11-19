from django.urls import path, re_path
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework_simplejwt import views as jwt_views
from . import views

from django.shortcuts import render

 
app_name = 'server'

urlpatterns = [
    path('api/notify', views.print_channel, name='channel_list'),
    path('api/books', views.BooksList.as_view(), name='post_list'),
    path('api/<str:author>/books', views.BooksList.as_view(), name='post_list_author'),
    path('api/books/categories', views.get_categories, name='categories'),
    path('api/books/<str:category>', views.BooksList.as_view(), name='post_list'),
    path('api/<str:author>/books/<str:category>', views.BooksList.as_view(), name='post_list_author'),
    path('api/book/<int:pk>/delete', views.BooksDetail.as_view(), name='post_delete'),
    path('api/book/<int:pk>/edit', views.BooksDetail.as_view(), name='post_edit'),
    path('api/book/<int:pk>', views.BooksDetail.as_view(), name='post_detail'),
    path('api/books/create', views.BooksList.as_view(), name='post_new'),
    path('api/authors', views.AuthorList.as_view(), name='author_list'),
    path('api/users', views.UsersList.as_view(), name='user_list'),
    path('api/user/<int:pk>/delete', views.UserDetail.as_view(), name='user_delete'),
    path('api/user/<int:pk>/edit', views.UserDetail.as_view(), name='user_edit'),
    path('api/user/<int:pk>', views.UserDetail.as_view(), name='user_detail'),
    path('api/register/reader/', views.register_reader, name="register"),
    path('activate/<uidb64>/<token>/',views.activate, name='activate'),
    path('api/register/librarian/', views.RegisterLibrarian.as_view(), name="registerlib"),
    path('api/token/obtain/', views.ObtainTokenPairWithUserType.as_view(), name='token_create'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', views.logout_request, name="logout"),
    path('api/requests', views.RequestList.as_view(), name="request_display"),
    path('api/requests/create', views.RequestList.as_view(), name="create_book"),
    path('api/requests/<str:status>', views.RequestList.as_view(), name="request_display"),
    path('api/<str:reader>/requests', views.RequestList.as_view(), name="request_display"),
    path('api/requests/create', views.RequestList.as_view(), name="create_book"),
    path('api/<str:reader>/requests/<str:status>', views.RequestList.as_view(), name="request_display_status"),
    path('api/request/<int:pk>/delete', views.RequestDetail.as_view(), name="request_finished"),
    path('api/request/<int:pk>/edit', views.RequestDetail.as_view(), name="request_denied"),
    path('api/request/<int:pk>', views.RequestDetail.as_view(), name="check_request"),
    path('api/records', views.RecordList.as_view(), name="display_record"),
    path('api/records/create', views.RecordList.as_view(), name="issue_book"),
    path('api/record/<int:pk>/return-book', views.RecordDetail.as_view(), name="return_book"),
    path('api/record/<int:pk>/pay-fine', views.RecordDetail.as_view(), name="return_book"),
    path('api/record/<int:pk>', views.RecordDetail.as_view(), name="check_record"),
    path('api/<str:reader>/records', views.RecordList.as_view(), name="check_record"),
    path('api/<str:reader>/records/<str:status>', views.RecordList.as_view(), name="check_pending_record"),
    path('api/analysis/books-issued', views.book_graph, name='graph_book'),
    path('api/analysis/stats', views.stats, name='stats'),
    path('api/analysis/<str:reader>/books-issued', views.book_graph, name='graph_book'),
    path('api/analysis/<str:reader>/stats', views.stats, name='stats_reader'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
