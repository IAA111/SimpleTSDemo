from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from submit import models
from submit.utils.bootstrap import BootStrapModelForm
from submit.utils.pagination import Pagination

# Create your views here.

global_train_thread = None

model_dict = {
    "Stat": ["modelA1", "modelA2", "modelA3"],
    "ML": ["modelB1", "modelB2", "modelB3"],
    "DL": ["modelC1", "modelC2", "modelC3"],
    }

InputeModel_list=["modelA1", "modelA2", "modelA3"]
PredictModel_list=["modelB1", "modelB2", "modelB3"]


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

def impute_model_select(request):
    return JsonResponse({
        'InputeModel_list': InputeModel_list,
        'PredictModel_list': PredictModel_list
    })


def get_models(request):
    model_class = request.GET.get('model_class', None)
    models = model_dict.get(model_class, [])
    return JsonResponse({'models': models})

@csrf_exempt
def train_save(request):
    '''
       前端返回形式
       {"ModelClassification":"ML ","ModelChoice":["modelB2","modelB3"],
        "TrainBatchSize":"20%","MissingMechanism":"option2",
        "MissingRate":"30%","AutoParameters":"option1"}  '''

    if request.method == "POST":
        data = json.loads(request.body)

        train_batch_size_str = data.get('TrainBatchSize')
        train_batch_size = float(train_batch_size_str.strip('%')) / 100

        missing_rate_str = data.get('MissingRate')
        missing_rate = float(missing_rate_str.strip('%')) / 100

        auto_parameters_map = {
            "option1": True,
            "option2": False,
        }
        missing_mechanism_map = {
            "option1": "MCAR",
            "option2": "MAR",
            "option3": "MNAR",
        }
        auto_parameters_bool = auto_parameters_map.get(data.get('AutoParameters'), False)
        missing_mechanism_str = missing_mechanism_map.get(data.get('MissingMechanism'), "default_value")

        obj = models.TrainParameters(
            model_classification=data.get('ModelClassification'),
            model_choice=json.dumps(data.get('ModelChoice')),
            train_batch_size=train_batch_size,
            missing_mechanism=missing_mechanism_str,
            missing_rate=missing_rate,
            auto_parameters=auto_parameters_bool,
        )
        obj.save()
        print(data)
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
            impute_model=data.get('ImputeModel'),
            predict_model=data.get('PredictModel'),
            perdict_batch_size=PredictBatchSize,
        )
        obj.save()
        print(data)
        return JsonResponse({"message": "Parameters were saved successfully."})
    else:
        return JsonResponse({"error": "error."})