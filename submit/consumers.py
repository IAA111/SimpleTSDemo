from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import StopConsumer
from asgiref.sync import async_to_sync
import asyncio
import json
import time
from asgiref.sync import sync_to_async
from submit.models import TrainParameters
from channels.consumer import AsyncConsumer

class TrainChatConsumer(AsyncConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.training_task = None        # 初始化训练任务为空
        self.start_time = None         # 训练开始时间

    # WebSocket连接成功
    async def websocket_connect(self, event):
        print("connected", event)
        await self.send({
            "type": "websocket.accept"  # 发送一个websocket.accept类型的消息以接受连接
        })

    # 当前端发送消息到服务器时
    async def websocket_receive(self,event):
        print("received", event)
        text_data = json.loads(event['text'])
        message = text_data['type']

        if message == "training.start":
            if self.training_task:
                self.training_task.cancel()
            self.start_time = time.time()
            self.training_task = asyncio.ensure_future(self.start_training())

        elif message == "training.stop" :
            if self.training_task:
                self.training_task.cancel()
                self.training_task = None

    # WebSocket连接断开
    async def websocket_disconnect(self, event):
        print("disconnected", event)

    async def start_training(self):
        start_time = time.time()
        duration = await self.train_all_models()

    async def send_status(self, status, start_time, total_model, model_count):
        await self.send({
            "type": "websocket.send",
            "text": json.dumps({
                "status": status,
                "start_time": start_time,
                "total_model": total_model,
                "model_count":model_count,
            })
        })

    async def train_all_models(self):

        # 获取训练参数
        # DL  ["modelC2"] 0.1 MCAR 0.1 True
        # <class 'str'> <class 'str'> <class 'float'> <class 'str'> <class 'float'> <class 'bool'>
        model_parameters = await sync_to_async(TrainParameters.objects.last, thread_sensitive=True)()


        model_classification = model_parameters.model_classification  # 模型分类
        model_choice = json.loads(model_parameters.model_choice)  # 模型列表
        train_batch_size = model_parameters.train_batch_size
        missing_mechanism = model_parameters.missing_mechanism
        missing_rate = model_parameters.missing_rate
        auto_parameters = model_parameters.auto_parameters

        model_count = 0
        total_model = len(model_choice)

        await self.send_status("Not started", self.start_time, total_model, model_count)


        '''     

            根据训练参数处理训练数据   

        '''

        '''
        对每个模型进行训练 

        for model in model_choice:

            if model == '...':
                ...()
            model_count += 1  

            # 发送当前训练状态

            status = "finished" if model_count == total_model else "in progress"
            await self.send_status(status,self.start_time, total_model, model_count)


        '''

        print("开始执行")
        await asyncio.sleep(3)

        training_end_time = time.time()
        training_duration = training_end_time - self.start_time
        print(training_duration)

        status = "finished" if model_count == total_model else "in progress"
        await self.send_status(status, self.start_time, total_model, model_count)



