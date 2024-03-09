import threading
import time
from submit.utils import train
class TrainThread(threading.Thread):
    def __init__(self):
        super(TrainThread, self).__init__()
        self.stopped = False
        self.training_start_time = None
        self.training_duration = None
        self.model_count = 0               # 记录训练完成的模型个数

    def run(self):
        self.stopped = False
        self.model_count, self.training_duration = train.train_all_models(self.stop_requested)

    def stop(self):
        self.stopped = True

    def get_training_duration(self):
        return self.training_duration

    def get_model_count(self):
        return self.model_count

    def stop_requested(self):
        return self.stopped  # return the current value of self.stopped
