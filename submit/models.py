from django.db import models
class TrainParameters(models.Model):
    impute_model = models.TextField()
    predict_model = models.TextField()
    train_data_size = models.FloatField()
    predict_window_size = models.FloatField()
    imputation_size = models.FloatField()
    dataset = models.FileField(verbose_name='dataset',max_length=128,upload_to='dataset/')
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
