$(function (){
    var selectedClass = 'myClass';
    // 预测模型下拉内容
    PredictModelSelect();
    // 补全模型下拉内容
    ImputeModelSelect();
    // 绑定点击 BtnTrainBatchSize 事件
    TrainBatchSize();
    // 绑定点击 BtnPredictBatch 事件
    PredictBatch();
    // 绑定点击 BtnTrainSetSave 按钮事件
    binBtnTrainSetSave();
    // 绑定点击 StartTrainToggle 事件
    StartTrain();

})

function TrainBatchSize(){
    $('#TrainBatch a').click(function(){
        $('#BtnTrainBatchSize').html($(this).text() + ' <span class="caret"></span>');
    });
}

function PredictBatch(){
    $('#PredictBatch a').click(function(){
        $('#BtnPredictBatch').html($(this).text() + ' <span class="caret"></span>');
    });
}

function PredictModelSelect(){
    var data = {
        models: ["Model 1", "Model 2", "Model 3", "Model 4"]
    };

    var selectList = $('#TrainPredictModel');

    $.each(data.models, function(i, model) {
        selectList.append('<li><label><input type="checkbox" value="' + model + '">' + model + '</label></li>');
    });

    $('.dropdown-menu').on('click', function(e) {
        if($(e.target).is('input[type="checkbox"]')) {
            e.stopImmediatePropagation();
        }
    });
}

function ImputeModelSelect(){

    $(document).ready(function() {
    var data = {
        models: ["Model 1", "Model 2", "Model 3", "Model 4"]
    };

    var selectList = $('#TrainImputeModel');

    // 通过遍历每个模型，将其添加到下拉菜单中
    $.each(data.models, function(i, model) {
        selectList.append('<li><a href="javascript:;" value="' + model + '">' + model + '</a></li>');
    });

    // 设置点击事件，让被选中的模型显示在按钮上
    $('#TrainImputeModel li').on('click', function() {
        $('#BtnTrainImputeModel').text($(this).text()).append('<span class="caret"></span>');
    });
});
}


function binBtnTrainSetSave() {
    $('#BtnTrainSetSave').click(function () {
        var form_data = new FormData();
        form_data.append("dataset", $('#upload')[0].files[0]);

        const fetchParams = () => ({
            impute_model: $("#BtnTrainImputeModel").text(),
            predict_model_choice: $('#TrainPredictModel input[type="checkbox"]:checked').map(function () {
                return this.value;
            }).get(),
            train_batch_size: $("#BtnTrainBatchSize").text().trim(),
            predict_data_Batch_size: $("#BtnPredictBatch").text().trim(),
        });

        const params = fetchParams();

        for ( var key in params ) {
             form_data.append(key, params[key]);
         }

        $.ajax({
            type: "POST",
            url: "/train/save/",
            data: form_data,
            processData: false,
            contentType: false,
            success: function (data) {
                console.log("Success: ", data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
             console.log(params);
             console.log("jqXHR: ", jqXHR);
             console.log("textStatus: ", textStatus);
             console.log("Error details: ", errorThrown);
             console.log(JSON.stringify(params));
   }})
        })}

function StartTrain(){
    let intervalId;
    let socket = new WebSocket("ws://localhost:8000/ws/train/")

    socket.onopen = function (e){
         console.log("Connection open");
    };

    document.getElementById('StartTrainToggle').addEventListener('change', (event) => {
      if (event.target.checked) {
        socket.send(JSON.stringify({"type": "training.start"}));
      } else {
        socket.send(JSON.stringify({"type": "training.stop"}));
        intervalId && clearInterval(intervalId);
        start_time = undefined;
      }
    });

    socket.onmessage = function(event){
        console.log(`return message:${event.data}`);
        let data = JSON.parse(event.data)

        start_time = new Date(data.start_time * 1000);
        data.start_time = start_time.toLocaleString();

        let impute_start_time = new Date(data.impute_start_time * 1000);
        let predict_start_time = new Date(data.predict_start_time * 1000);

        document.getElementById("imputeStatus").textContent = data.impute_status;
        document.getElementById("predictStatus").textContent = data.predict_status;
        document.getElementById("ModelCount").textContent = data.model_count + "/" + data.total_model;

         if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(() => {
            updateTaskTime(impute_start_time, predict_start_time);
        }, 1000);

        if (data.predict_status === "finished") {
            clearInterval(intervalId);
        }
    }
          function updateTaskTime(imputeStartTime, predictStartTime) {
    let currentTime = new Date();

    if (document.getElementById("imputeStatus").textContent !== "finished") {
        let imputeTime = parseInt((currentTime - imputeStartTime) / 1000);
        let formattedImputeTime = formatTime(imputeTime);
        document.getElementById("imputeTaskTime").textContent = formattedImputeTime;
    }

    if (document.getElementById("predictStatus").textContent !== "Not Started" &&
        document.getElementById("predictStatus").textContent !== "finished") {
        let predictTime = parseInt((currentTime - predictStartTime) / 1000);
        let formattedPredictTime = formatTime(predictTime);
        document.getElementById("predictTaskTime").textContent = formattedPredictTime;
    }
}

// 将获得的秒数转换为 HH:MM:SS 格式
    function formatTime(seconds) {
        let hours = parseInt(seconds / 3600);
        let minutes = parseInt((seconds % 3600) / 60);
        let remainingSeconds = seconds % 60;

        return `${hours}:${minutes}:${remainingSeconds}`;
    }

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`Connection closed properly：${event.code},${event.reason}`);
        } else {
            console.log('disconnect');
        }
        intervalId && clearInterval(intervalId);
        start_time = undefined;
    };

    socket.onerror = function(error) {
        console.log(`[error] ${error.message}`);
    };

}

