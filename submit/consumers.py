import asyncio
import json
import time
from asgiref.sync import sync_to_async
from submit.models import TrainParameters
from submit.models import Task
from channels.consumer import AsyncConsumer
from . import models
from . import views


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
        await self.train_all_models()

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

        await self.send_status("Progressing", self.start_time, total_model, model_count)


        '''     

        1.根据训练参数处理训练数据   

        '''

        '''
        2.对每个模型进行训练 
        
        models.TrainResult.objects.all().delete()   

        for model in model_choice:

            if model == '...':
                start = time.time
                ...()
                
                time = time.time() - start
                model_count += 1  

                # 发送当前训练状态
                await self.send_status(status,self.start_time, total_model, model_count)
              
               
                # 将该模型训练结果保存到数据表中
                form = views.TrainResultForm()
                form.model = model
                form.time = time
                form.mae = mae
                form.accuracy = accuracy
                
                if form.is_valid():
                    form.save()
                    return redirect("/train/")
                else:
                    print(form.errors)
            


        '''

        print("开始执行")
        await asyncio.sleep(10)

        training_end_time = time.time()
        training_duration = training_end_time - self.start_time
        print(training_duration)

        status = "finished"
        await self.send_status(status, self.start_time, total_model, model_count)


class TaskChatConsumer(AsyncConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.task = None
        self.impute_start_time = None
        self.predict_start_time = None

    # WebSocket连接成功
    async def websocket_connect(self, event):
        print("connected", event)
        await self.send({
            "type": "websocket.accept"    # 发送一个websocket.accept类型的消息以接受连接
        })

    # 当前端发送消息到服务器时
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

    # WebSocket连接断开
    async def websocket_disconnect(self, event):
        print("disconnected", event)

    async def start_task(self):
        self.impute_start_time = time.time()
        await self.impute()
        self.predict_start_time = time.time()
        await self.predict()

    async def send_status(self, impute_status, impute_start_time,predict_status, predict_start_time):
        await self.send({
            "type": "websocket.send",
            "text": json.dumps({
                "impute_status": impute_status,
                "impute_start_time": impute_start_time,
                "predict_status": predict_status,
                "predict_start_time": predict_start_time,
            })
        })

    async def impute(self):
        # 补全模型选择
        task = await sync_to_async(Task.objects.last, thread_sensitive=True)()
        impute_model = task.impute_model   # 获取到的补全模型名
        print(impute_model)

        # 传递状态到前端
        self.impute_start_time = time.time()
        self.impute_status = "progressing"
        self.predict_status = ("Not Started")
        await self.send_status(self.impute_status, self.impute_start_time,self.predict_status, self.predict_start_time)


        # 执行补全
        print("开始执行补全")
        await asyncio.sleep(10)
        '''
        
             补全过程
             
             
             impute_data.save()   # 对每条补全数据存储到mysql
             
             data={
                     "impute_data": {'index' : 10 , 'value': [f1, f2, f3, ...]},  
                     "anomaly_detection": {'anomaly': True, 'reason': 'some reason'} or  {'anomaly': False, 'reason': None}                                      
              }
             
             await self.send({
                "type": "websocket.send",
                "text": json.dumps({
                     "impute_data": data, 
                })
             })
             
                    

        '''

        


        self.impute_status = "finished"
        await self.send_status(self.impute_status, self.impute_start_time, self.predict_status, self.predict_start_time)
        print("impute")


    async def predict(self):
        # 预测参数
        task = await sync_to_async(Task.objects.last, thread_sensitive=True)()
        predict_model = task.predict_model                     # 获取到的预测模型名
        perdict_batch_size = task.perdict_batch_size
        print(predict_model, perdict_batch_size)


        self.predict_time = time.time()
        self.predict_status = "progressing"
        await self.send_status(self.impute_status, self.impute_start_time, self.predict_status, self.predict_start_time)

        print("开始执行预测")

        '''  
          
             预测过程
        
             
        '''



        await asyncio.sleep(10)
        self.predict_status = "finished"
        await self.send_status(self.impute_status, self.impute_start_time, self.predict_status, self.predict_start_time)
        print("predict")