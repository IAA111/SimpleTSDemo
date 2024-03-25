from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.core import serializers
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
    page_object = Pagination(request, queryset)
    form = TrainResultForm()
    context = {
        'form': form,
        'queryset': page_object.page_queryset,
        'page_string': page_object.html()
    }
    return render(request, 'home.html', context)

@csrf_exempt
def train_save(request):
    if request.method == 'POST':

        impute_model = request.POST['impute_model']
        predict_model = request.POST['predict_model']
        train_data_size_str = request.POST['train_data_size']
        train_data_size = float(train_data_size_str.strip('%')) / 100
        predict_window_size_str = request.POST['predict_window_size']
        predict_window_size = float(predict_window_size_str.strip('%')) / 100
        imputation_size_str = request.POST['imputation_size']
        imputation_size = float(imputation_size_str.strip('%')) / 100
        # 处理文件上传
        dataset = request.FILES['dataset'] if 'dataset' in request.FILES else None

        # 存入数据库
        obj = models.TrainParameters(
            impute_model=impute_model,
            predict_model=predict_model,
            train_data_size=train_data_size,
            predict_window_size=predict_window_size,
            imputation_size= imputation_size,
            dataset=dataset
        )
        obj.save()
        print(obj)

        return JsonResponse({"message": "TrainParameters Successfully Saved"})
    else:
        return JsonResponse({"error": "error"}, status=400)


@csrf_exempt
def task_save(request):
    if request.method == "POST":
        data = json.loads(request.body)

        PredictWindowSizestr = data.get('PredictWindowSize')
        PredictWindowSize = float(PredictWindowSizestr.strip('%')) / 100

        obj = models.Task(
            impute_model=data.get('ImputeModel'),
            predict_model=data.get('PredictModel'),
            predict_window_size=PredictWindowSize,
        )
        obj.save()
        print(data)
        return JsonResponse({"message": "Parameters were saved successfully."})
    else:
        return JsonResponse({"error": "error."})

def home(request):
    return render(request, 'home.html')

def predict(request):
    return render(request, 'predict.html')