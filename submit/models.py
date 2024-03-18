from django.db import models
# 存储训练参数
class TrainParameters(models.Model):
    impute_model = models.CharField(max_length=10)
    predict_model_choice = models.TextField()
    train_batch_size = models.FloatField()
    predict_data_Batch_size = models.FloatField()

# 存储训练结果
class TrainResult(models.Model):
    model = models.CharField(max_length=20)
    time = models.TimeField()
    accuracy = models.FloatField()
    precision = models.FloatField()
    SMAPE = models.FloatField()

class Task(models.Model):
    predict_model = models.CharField(max_length=10)
    predict_batch_size = models.FloatField()
