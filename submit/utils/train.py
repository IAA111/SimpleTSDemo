import time
from submit.models import TrainParameters
import json
import asyncio
from asgiref.sync import sync_to_async
async def train_all_models():

    # DL  ["modelC2"] 0.1 MCAR 0.1 True
    # <class 'str'> <class 'str'> <class 'float'> <class 'str'> <class 'float'> <class 'bool'>
    model_parameters = await sync_to_async(TrainParameters.objects.last, thread_sensitive=True)()

    model_classification = model_parameters. model_classification    # 模型分类
    model_choice = json.loads(model_parameters.model_choice)         # 模型列表
    train_batch_size = model_parameters.train_batch_size
    missing_mechanism = model_parameters.missing_mechanism
    missing_rate = model_parameters.missing_rate
    auto_parameters = model_parameters.auto_parameters

    model_count = 0
    total_model = len(model_choice)
    training_start_time = time.time()

    '''     
        
        根据参数处理训练数据   
                 
    '''

    '''
    对每个模型进行训练 
    
    for model in model_choice:
           
        if model == '...':
            ...()
        model_count += 1  
        
        # 发送当前训练状态
        
        status = "finished" if model_count == total_model else "in progress"
        await self.send_status(status,start_time, total_model, model_count)
         
           
    '''

    print("开始执行")
    await asyncio.sleep(3)

    training_end_time = time.time()
    training_duration = training_end_time - training_start_time    # 总共花时
    print (training_duration)

    status = "finished" if model_count == total_model else "in progress"
    await self.send_status(status, training_start_time, total_model, model_count)


    return  training_duration

