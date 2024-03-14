from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from submit import models
from submit.utils.bootstrap import BootStrapModelForm
from submit.utils.pagination import Pagination

# Create your views here.

class TrainResultForm(BootStrapModelForm):
    class Meta:
        model = models.TrainResult
        fields = '__all__'

def train_show(request):
    queryset = models.TrainResult.objects.all()
    form = TrainResultForm()
    context = {
        'form': form,
        'queryset': queryset,
    }
    return render(request, 'train.html', context)

def impute_show(request):
    return render(request,'impute.html')


@csrf_exempt
def train_save(request):
    '''
       前端返回形式
       {'impute_model': 'Model 1',
        'predict_model_choice': ['Model 2', 'Model 3', 'Model 4'],
        'train_batch_size': '40%',
        'predict_data_Batch_size': '60%'}  '''

    if request.method == "POST":
        data = json.loads(request.body)

        train_batch_size_str = data.get('train_batch_size')
        train_batch_size = float(train_batch_size_str.strip('%')) / 100

        predict_data_Batch_size_str = data.get('predict_data_Batch_size')
        predict_data_Batch_size = float(predict_data_Batch_size_str.strip('%')) / 100

        obj = models.TrainParameters(
            impute_model=data.get('impute_model'),
            predict_model_choice=json.dumps(data.get('predict_model_choice')),
            train_batch_size=train_batch_size,
            predict_data_Batch_size=predict_data_Batch_size
        )
        obj.save()
        print(obj)
        return JsonResponse({"message": "Parameters were saved successfully."})
    else:
        return JsonResponse({"error": "error."})


@csrf_exempt
def task_save(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)

        PredictBatchSizestr = data.get('PredictBatchSize')
        PredictBatchSize = float(PredictBatchSizestr.strip('%')) / 100

        obj = models.Task(
            predict_model=data.get('PredictModel'),
            predict_batch_size=PredictBatchSize,
        )
        obj.save()
        print(data)
        return JsonResponse({"message": "Parameters were saved successfully."})
    else:
        return JsonResponse({"error": "error."})

def home(request):
    return render(request, 'home.html')