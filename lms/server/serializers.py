from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Book, Record, Request, Author


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super(MyTokenObtainPairSerializer, self).validate(attrs)
        data.update({'User': 'staff' if self.user.is_staff else 'reader'})
        data.update({'id': self.user.id})
        data.update({'admin': 'yes' if self.user.is_superuser else ''})
        return data

    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)
        token['User'] = 'staff' if user.is_staff else 'reader'
        return token


class BooksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ('id', 'cover', 'title', 'summary', 'author', 'published_on', 'category', 'quantity', 'isbn', 'language_code', 'publisher')


class RecordSerializer(serializers.ModelSerializer):
    fine = serializers.ReadOnlyField()
    class Meta:
        model = Record
        fields = ('id', 'reader', 'book', 'issue_date', 'return_date', 'fine', 'issue_period_weeks', 'fine_status')
    
    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['book'] = BooksSerializer(instance.book).data
        return response


class RequestSerializer(serializers.ModelSerializer):
    reader = serializers.ReadOnlyField(source='reader.username')
    class Meta:
        model = Request
        fields = ('id', 'reader', 'book', 'status', 'issue_period_weeks')
        
    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['book'] = BooksSerializer(instance.book).data
        return response


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'id', 'date_joined', 'is_active')


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ('name', 'id')
