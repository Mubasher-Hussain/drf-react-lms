import json

from channels.generic.websocket import AsyncWebsocketConsumer
from server.views import redis_instance

class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope['user']
        if self.user.username:
            await self.accept()
            redis_instance.set(self.user.username, self.channel_name)

    async def disconnect(self, close_code):
        redis_instance.delete(self.user.username)
        pass

    async def notify_user(self, event):
        await self.send(text_data=event['text'])

    