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
    dataset = models.CharField(max_length=64)
    train_time = models.CharField(max_length=20)
    predict_time = models.CharField(max_length=20)
    accuracy = models.FloatField()
    precision = models.FloatField()
    SMAPE = models.FloatField()

class Task(models.Model):
    impute_model = models.CharField(max_length=20)
    predict_model = models.CharField(max_length=20)
    predict_window_size = models.FloatField()

class ImputeResult(models.Model):
    time = models.CharField(max_length=24)
    variable = models.IntegerField()
    Imputed_value = models.FloatField()

class AnomalyResult(models.Model):
    time = models.CharField(max_length=24)
    variable = models.IntegerField()
    true_value = models.FloatField()
    predict_value = models.FloatField()
    analysis = models.CharField(max_length=255, default='')

class Impdata(models.Model):
    index = models.IntegerField()
    data = models.TextField()  # 用于存储数据
    mask = models.TextField()  # 用于存储掩码
    predicted_data = models.TextField()
    predicted_mask = models.TextField()
    time = models.DateTimeField()
    def __str__(self):
        return f"Index: {self.index}, Data: {self.data}, Mask: {self.mask}"
