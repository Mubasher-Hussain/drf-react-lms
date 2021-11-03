import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from server.models import Address


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope['user']
        if self.user.username:
            await self.accept()
            await Address.create(user=self.user , channel_name=self.channel_name)        

    async def disconnect(self, close_code):
        await Address.delete(channel_name=self.channel_name)
        pass

    async def notify_user(self, event):
        await self.send(text_data=event['text'])

    