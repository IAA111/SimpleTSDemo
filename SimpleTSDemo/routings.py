from django.urls import re_path
from submit import consumers
websocket_urlpatterns = [
    re_path(r"ws/train/$", consumers.TrainChatConsumer.as_asgi())
    ]