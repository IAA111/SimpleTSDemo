import time
from submit.models import TrainParameters
import json
def train_all_models(stopped_callback):

    # DL  ["modelC2"] 0.1 MCAR 0.1 True
    # <class 'str'> <class 'str'> <class 'float'> <class 'str'> <class 'float'> <class 'bool'>
    model_parameters = TrainParameters.objects.last()

    model_classification = model_parameters. model_classification  # 模型分类
    model_choice = json.loads(model_parameters.model_choice)       # 模型列表
    train_batch_size = model_parameters.train_batch_size
    missing_mechanism = model_parameters.missing_mechanism
    missing_rate = model_parameters.missing_rate
    auto_parameters = model_parameters.auto_parameters


    ''' model_parameters 的具体形式为 '''
    model_count = 0
    training_start_time = time.time()


    ''' 循环训练所有模型 
    
    
    '''

    print("开始执行")
    time.sleep(3)  # 暂停5秒
    print("3秒后继续执行")

    training_end_time = time.time()
    training_duration = training_end_time - training_start_time
    print (training_duration)

    return model_count, training_duration

