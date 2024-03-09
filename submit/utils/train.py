import time
from submit.models import TrainParameters

def train_all_models(stopped_callback):

    model_parameters = TrainParameters.objects.last()
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

