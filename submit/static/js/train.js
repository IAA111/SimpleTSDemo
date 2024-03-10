$(function (){
    var selectedClass = 'myClass';
    // 绑定点击模型分类选择按钮绑定事件
    ModelSelect();
    // 获取模型列表
    GetModels(selectedClass);
    // 绑定点击 BtnTrainBatchSize 事件
    TrainBatchSize();
    // 绑定点击 MissingRate 事件
    MissingRate();
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

function MissingRate(){
    $('#MissingRate a').click(function(){
        $('#BtnMissingRate').html($(this).text() + ' <span class="caret"></span>');
    });
}

function ModelSelect(){
    $('#modelClass a').click(function(){
        var caret = '<span class="caret"></span>';
        $('#BtnModelClassification').html($(this).text() + ' ' + caret);
        GetModels($(this).text());
    });
}

function GetModels(selectedClass){
    $.get("/get_models/?model_class=" + selectedClass, function(data) {
        var selectList = $('#modelChoice');
        selectList.empty(); // 清空modelName下拉菜单

        $.each(data.models, function(i, model) {
            selectList.append('<li><label><input type="checkbox" value="' + model + '">' + model + '</label></li>');
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
        console.log(`status: ${data.status}`);
        console.log(`start_time: ${data.start_time}`);
        console.log(`total_model: ${data.total_model}`);
        console.log(`model_count: ${data.model_count}`)

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