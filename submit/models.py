from django.db import models

# Create your models here.

# 存储训练参数
class TrainParameters(models.Model):
    impute_model = models.CharField(max_length=10)
    predict_model_choice = models.TextField()
    train_batch_size = models.FloatField()
    missing_rate = models.FloatField()

# 存储训练结果
class TrainResult(models.Model):
    model = models.CharField(max_length=20)
    time = models.TimeField()
    rmes = models.FloatField()
    mae = models.FloatField()
    accuracy = models.FloatField()

class Task(models.Model):
    impute_model = models.CharField(max_length=10)
    predict_model = models.CharField(max_length=10)
    perdict_batch_size = models.FloatField()