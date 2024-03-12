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
        const fetchParams = () => ({
            ModelClassification: $("#BtnModelClassification").text(),
            ModelChoice: $('#modelChoice input[type="checkbox"]:checked').map(function () {
                return this.value;
            }).get(),
            TrainBatchSize: $("#BtnTrainBatchSize").text().trim(),
            MissingMechanism: $("input[name='Mechanism']:checked").val(),
            MissingRate: $("#BtnMissingRate").text().trim(),
            AutoParameters: $("input[name='automatic']:checked").val()
        });

        const params = fetchParams();

        $.ajax({
            type: "POST",
            url: "/train/save/",
            dataType: "JSON",
            data: JSON.stringify(params),
            success: function (data) {
                console.log(JSON.stringify(params));
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
    let start_time;
    let socket = new WebSocket("ws://localhost:8000/ws/train/")

    socket.onopen = function (e){
         console.log("Connection open");
         document.getElementById('StartTrainToggle').checked && socket.send(JSON.stringify({"type": "training.start"}));
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

        document.getElementById("status").textContent = data.status;
        document.getElementById("ModelCount").textContent = data.model_count + "/" + data.total_model;

        function updateTrainedTime() {
            if (start_time === undefined) {
                return;
            }
            let current_time = Date.now() / 1000;
            let trained_time = parseInt(current_time - start_time / 1000);
            let hours = parseInt(trained_time / 3600);
            let minutes = parseInt((trained_time % 3600) / 60);
            let seconds = (trained_time % 3600) % 60;

            let formatted_time = [hours, minutes, seconds].join(':');
            console.log(formatted_time)
            document.getElementById("trainedTime").textContent = formatted_time;
        }

        intervalId = setInterval(updateTrainedTime, 1000);

        if (data.status === "finished") {
            clearInterval(intervalId);
            start_time = undefined;
            return;
        }
    };

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