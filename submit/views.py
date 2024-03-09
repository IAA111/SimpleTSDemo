from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from submit import models
from submit.utils.train_thread_module import TrainThread
# Create your views here.

global_train_thread = None
model_dict = {
    "Stat": ["modelA1", "modelA2", "modelA3"],
    "ML": ["modelB1", "modelB2", "modelB3"],
    "DL": ["modelC1", "modelC2", "modelC3"],
    }

def show(request):
    return render(request,'train.html')

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
        missing_rate = float(train_batch_size_str.strip('%')) / 100

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
def train_start(request):
    global global_train_thread
    if global_train_thread is not None and global_train_thread.is_alive():
        return JsonResponse({
            'status': 'error',
            'message': 'TrainThread is already running.'
        })
    global_train_thread = TrainThread()
    global_train_thread.start()

    return JsonResponse({
        'status': 'success',
        'message': 'TrainThread started.'
    })


@csrf_exempt
def train_stop(request):
    global global_train_thread

    if global_train_thread is None or not global_train_thread.is_alive():
        return JsonResponse({
            'status': 'error',
            'message': 'No active TrainThread to stop.'
        })
    global_train_thread.stop()
    global_train_thread = None

    print("stop")

    return JsonResponse({
        'status': 'success',
        'message': 'TrainThread stopped.'
    })
