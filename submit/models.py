from django.db import models

# Create your models here.

# 存储训练参数
class TrainParameters(models.Model):
    model_classification = models.CharField(max_length=20)
    model_choice = models.TextField()
    train_batch_size = models.FloatField()
    missing_mechanism = models.CharField(max_length=20)
    missing_rate = models.FloatField()
    auto_parameters = models.BooleanField(default=False)

