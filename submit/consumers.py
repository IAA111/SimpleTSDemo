import asyncio
import json
import time
from asgiref.sync import sync_to_async
from submit.models import TrainParameters
from submit.models import Task
from channels.consumer import AsyncConsumer
import csv
from . import models
from . import views


class TrainChatConsumer(AsyncConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.training_task = None        # 初始化训练任务为空
        self.impute_start_time = None
        self.predict_start_time = None
        self.total_model = None
        self.model_count = None
        self.impute_model = None
        self.predict_model_choice = None
        self.train_batch_size = None
        self.predict_data_Batch_size = None

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
        # 获取训练参数
        model_parameters = await sync_to_async(TrainParameters.objects.last, thread_sensitive=True)()
        self.impute_model = model_parameters.impute_model                              # 补全模型
        self.predict_model_choice = json.loads(model_parameters.predict_model_choice)  # 预测模型列表
        self.train_batch_size = model_parameters.train_batch_size
        self.predict_data_Batch_size = model_parameters.predict_data_Batch_size
        self.model_count = 0

        if model_parameters.dataset:  # 检查dataset是否有文件
            with model_parameters.dataset.open('r') as f:  # 注意这里我们以文本模式打开文件
                csv_reader = csv.reader(f)  # 创建一个csv阅读器
                for row in csv_reader:  # 遍历文件中的每一行
                    print(row)  # row是一个列表，包含了这一行的所有列的值

        await self.impute()
        await self.train_all_models()

    async def send_status(self, impute_status, impute_start_time,predict_status, predict_start_time,total_model, model_count):
        await self.send({
            "type": "websocket.send",
            "text": json.dumps({
                "impute_status": impute_status,
                "impute_start_time": impute_start_time,
                "predict_status": predict_status,
                "predict_start_time": predict_start_time,
                "total_model": total_model,
                "model_count":model_count,
            })
        })

    async def impute(self):
        self.impute_start_time = time.time()
        self.impute_status = "progressing"
        self.predict_status = "Not Started"
        await self.send_status(self.impute_status, self.impute_start_time, self.predict_status, self.predict_start_time,len(self.predict_model_choice), self.model_count)

        # 执行补全


        await asyncio.sleep(10)
        '''
             补全过程
        '''
        self.impute_status = "finished"
        await self.send_status(self.impute_status, self.impute_start_time, self.predict_status, self.predict_start_time,len(self.predict_model_choice), self.model_count)
        print("impute complete")

    async def train_all_models(self):
        self.predict_start_time = time.time()
        self.predict_status = "Progressing"
        await self.send_status(self.impute_status, self.impute_start_time, self.predict_status, self.predict_start_time,
                               len(self.predict_model_choice), self.model_count)


        ''' 对每个预测模型进行训练 
    
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
        await self.send_status(self.impute_status, self.impute_start_time, self.predict_status, self.predict_start_time,
                               len(self.predict_model_choice), self.model_count)


class TaskChatConsumer(AsyncConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.task = None
        self.start_time = None
        self.status = None

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
        await self.predict()

    async def send_status(self, status, start_time):
        await self.send({
            "type": "websocket.send",
            "text": json.dumps({
                "status": status,
                "start_time": start_time,
            })
        })

    async def predict(self):
        # 预测参数
        task = await sync_to_async(Task.objects.last, thread_sensitive=True)()
        predict_model = task.predict_model                     # 获取到的预测模型名
        predict_batch_size = task.predict_batch_size
        print(predict_model, predict_batch_size)

        self.start_time = time.time()
        self.status = "progressing"
        await self.send_status(self.status, self.start_time)

        print("开始执行预测")

        '''  
          
             预测过程
        
        '''

        await asyncio.sleep(10)
        self.predict_status = "finished"
        await self.send_status(self.predict_status, self.start_time)
        print("predict")