from django.db import models

# Create your models here.

# 存储训练参数
class TrainParameters(models.Model):
    model_classification = models.CharField(max_length=10)
    model_choice = models.TextField()
    train_batch_size = models.FloatField()
    missing_mechanism = models.CharField(max_length=10)
    missing_rate = models.FloatField()
    auto_parameters = models.BooleanField(default=False)

# 存储训练结果
class TrainResult(models.Model):
    model = models.CharField(max_length=20)
    time = models.TimeField()
    rmes = models.FloatField()
    mae = models.FloatField()
    accuracy = models.FloatField()
