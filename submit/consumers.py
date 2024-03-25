import asyncio
import json
import time
from asgiref.sync import sync_to_async
from submit.models import TrainParameters
from submit.models import Task
from channels.consumer import AsyncConsumer
import csv
import pandas as pd
from . import models
from . import views


class TrainChatConsumer(AsyncConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.training_task = None
        self.impute_status = None
        self.predict_status = None
        self.impute_start_time = None
        self.predict_start_time = None
        self.impute_total_model = None
        self.impute_model_count = None
        self.predict_total_model = None
        self.predict_model_count = None
        self.impute_model = None
        self.predict_model = None
        self.train_data_size = None
        self.predict_window_size = None
        self.imputation_size = None
        self.dataset = None

    # WebSocket连接成功
    async def websocket_connect(self, event):
        print("connected", event)
        await self.send({
            "type": "websocket.accept"
        })

    # 当前端发送消息到服务器时
    async def websocket_receive(self,event):
        print("received", event)
        text_data = json.loads(event['text'])
        message = text_data['type']

        if message == "training.start":
            if self.training_task:
                self.training_task.cancel()
            self.training_task = asyncio.ensure_future(self.start_training())

        elif message == "training.stop":
            if self.training_task:
                self.training_task.cancel()
                self.training_task = None

    # WebSocket连接断开
    async def websocket_disconnect(self, event):
        print("disconnected", event)

    async def start_training(self):
        # 获取训练参数
        model_parameters = await sync_to_async(TrainParameters.objects.last, thread_sensitive=True)()
        self.impute_model = model_parameters.impute_model.split(',')
        self.predict_model = model_parameters.predict_model.split(',')
        self.train_data_size = model_parameters.train_data_size
        self.predict_window_size = model_parameters.predict_window_size
        self.imputation_size = model_parameters.imputation_size
        self.impute_model_count = 0
        self.predict_model_count = 0
        self.impute_total_model = len(self.impute_model)
        self.predict_total_model = len(self.predict_model)

        if model_parameters.dataset:
            self.dataset = model_parameters.dataset.open('r')            # 读取 dataset 文件

        await self.impute()
        self.dataset.close()                                             # 关闭 dataset 文件
        await self.train_all_models()

    async def send_status(self):
        await self.send({
            "type": "websocket.send",
            "text": json.dumps({
                "impute_status": self.impute_status,
                "impute_start_time": self.impute_start_time,
                "predict_status": self.predict_status,
                "predict_start_time": self.predict_start_time,
                "impute_total_model": self.impute_total_model,
                "impute_model_count":self.impute_model_count,
                "predict_total_model": self.predict_total_model,
                "predict_model_count": self.predict_model_count,
            })
        })

    async def impute(self):
        self.impute_start_time = time.time()
        self.impute_status = "progressing"
        self.predict_status = "Not Started"
        await self.send_status()

        df = pd.read_csv(self.dataset)             # 读取所有数据
        print(df)

        await asyncio.sleep(10)

        '''
             补全过程 根据补全模型选择合适的补全方法进行补全
             将补全结果保存在数据库中
        '''

        self.impute_status = "finished"
        await self.send_status()
        print("impute complete")

    async def train_all_models(self):
        self.predict_start_time = time.time()
        self.predict_status = "Progressing"
        await self.send_status()


        ''' 
        从数据库中获取已经补全的数据
        
        对每个预测模型进行训练 
    
        for model in predict_model_choice:

            if model == '...':
                start = time.time
                ...()
                
                time = time.time() - start
                model_count += 1  

                # 发送当前训练状态
                await self.send_status(self.impute_status, self.impute_start_time, self.predict_status, self.predict_start_time,
                               len(self.predict_model_choice), self.model_count)
              
              
                # 将该模型训练结果保存到数据表中
                form = views.TrainResultForm()
                form.model = model
                form.time = time
                form.accuracy = accuracy
                form.precision = precision
                form.SMAPE = SMAPE
                
                if form.is_valid():
                    form.save()
                    return redirect("/train/")
                else:
                    print(form.errors)
            
        '''
        await asyncio.sleep(10)

        self.predict_status = "finished"
        await self.send_status()


class TaskChatConsumer(AsyncConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.task = None
        self.start_time = None
        self.status = None
        self.impute_model = None
        self.predict_model = None
        self.predict_window_size = None

    async def websocket_connect(self, event):
        print("connected", event)
        await self.send({
            "type": "websocket.accept"
        })

    async def websocket_receive(self, event):
        print("received", event)
        text_data = json.loads(event['text'])
        message = text_data['type']

        if message == "task.start":
            if self.task:
                self.task.cancel()
            self.task = asyncio.ensure_future(self.start_task())

        elif message == "task.stop":
            if self.task:
                self.task.cancel()
                self.task = None

    async def websocket_disconnect(self, event):
        print("disconnected", event)

    async def start_task(self):
        # 获取参数
        await self.predict()

    async def send_status(self):
        await self.send({
            "type": "websocket.send",
            "text": json.dumps({
                "status": self.status,
                "start_time": self.start_time,
            })
        })

    async def predict(self):
        self.start_time = time.time()
        self.status = "progressing"
        await self.send_status()

        print("开始执行预测")

        '''  

             预测过程

        '''

        await asyncio.sleep(10)
        self.status = "finished"
        await self.send_status()
        print("predict")