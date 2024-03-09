from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import StopConsumer
from asgiref.sync import async_to_sync
import asyncio
import json
import time
from channels.consumer import AsyncConsumer
from submit.utils.train import train_all_models

class TrainChatConsumer(AsyncConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.training_task = None  # 初始化训练任务为空
        self.start_time = None  # 训练开始时间

    # WebSocket连接成功建立时，该方法将被调用
    async def websocket_connect(self, event):
        print("connected", event)
        await self.send({
            "type": "websocket.accept"  # 发送一个websocket.accept类型的消息以接受连接
        })

    # 当前端发送消息到服务器时，该方法将被调用
    async def websocket_receive(self,event):
        print("received", event)
        text_data = json.loads(event['text'])
        message = text_data['type']

        if message == "training.start":
            if self.training_task:
                self.training_task.cancel()
            self.start_time = time.time()
            self.training_task = asyncio.ensure_future(self.start_training())

        elif message == "training.stop" or message == "chat.message":
            if self.training_task:
                self.training_task.cancel()
                self.training_task = None
            if message == "chat.message":
                await self.send({
                    'type': 'websocket.send',
                    'text': text_data['message']
                })

    # 当WebSocket连接断开时，该方法将被调用
    async def websocket_disconnect(self, event):
        print("disconnected", event)

    async def start_training(self):
        model_count, duration = await train_all_models()


