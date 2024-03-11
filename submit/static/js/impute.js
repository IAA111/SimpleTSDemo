$(function (){
    // 绑定点击 PredictBatchSize 事件
    PredictBatchSize();
    // 获取补全模型列表
    ModelSelect();
    // Task
    Task();
    // 保存任务配置
    TaskSetSave();



})

function PredictBatchSize(){
    $('#PredictBatch a').click(function(){
        $('#PredictBatchSize').html($(this).text() + ' <span class="caret"></span>');
    });
}

function ModelSelect() {
    $.ajax({
        url: '/model_select/',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log(data);
            var ulElement = $('#ImputeModel').next('.dropdown-menu');

            $.each(data.InputeModel_list, function(i,model){
                var li = $('<li></li>');
                var label = $('<label></label>');
                var radio = $('<input type="radio" name="impute_model" value="' + model + '">');
                label.append(radio);
                label.append(model);
                li.append(label);
                ulElement.append(li);

                li.on('click', function(){
                    $('#ImputeModel').text(model);
                    $('#ImputeModel').dropdown('toggle');
                });
            });

            ulElement = $('#PredictModel').next('.dropdown-menu');

            $.each(data.PredictModel_list, function(i,model){
                var li = $('<li></li>');
                var label = $('<label></label>');
                var radio = $('<input type="radio" name="predict_model" value="' + model + '">');
                label.append(radio);
                label.append(model);
                li.append(label);
                ulElement.append(li);

                li.on('click', function(){
                    $('#PredictModel').text(model);
                    $('#PredictModel').dropdown('toggle');
                });
            });
        },
    });
}


function Task() {
    let intervalId;
    let start_time;
    let socket = new WebSocket("ws://localhost:8000/ws/task/")

    socket.onopen = function (e){
        console.log("Connection open");
    };

    document.getElementById('taskToggle').addEventListener('change', (event) => {
      if (event.target.checked) {
        socket.send(JSON.stringify({"type": "task.start"}));
      } else {
        socket.send(JSON.stringify({"type": "task.stop"}));
      }
    });

    document.getElementById('stopTask').addEventListener("click", function() {
        socket.send(JSON.stringify({"type": "task.stop"}));
        document.getElementById('taskToggle').checked = false;
    });

    socket.onmessage = function(event){
        console.log(`return message:${event.data}`);
        let data = JSON.parse(event.data);

        let impute_start_time = new Date(data.impute_start_time * 1000);
        let predict_start_time = new Date(data.predict_start_time * 1000);

        document.getElementById("imputeStatus").textContent = data.impute_status;
        document.getElementById("predictStatus").textContent = data.predict_status;

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
    };

    socket.onerror = function(error) {
        console.log(`[error] ${error.message}`);
    };
}

function TaskSetSave() {
    document.getElementById('taskToggle').addEventListener('change', (event) => {
        if (event.target.checked) {
            const fetchParams = () => ({
                ImputeModel: $('#ImputeModel').text(),
                PredictModel: $('#PredictModel').text(),
                PredictBatchSize: $('#PredictBatchSize').text().trim()
            });

            const params = fetchParams();

            $.ajax({
                type: "POST",
                url: "/task/save/",
                dataType: "JSON",
                data: JSON.stringify(params),
                success: function (data) {
                    console.log(JSON.stringify(params));
                    console.log("Success: ", data);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
    });
}




















var myChart = echarts.init(document.querySelector('.box'));

    function randomData() {
        now = new Date(+now + oneDay);
        value = value + Math.random() * 21 - 10;
        return {
            name: now.toString(),
            value: [
                [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
                Math.round(value)
            ]
        };
    }

    let data = [];
    let now = new Date(1997, 9, 3);
    let oneDay = 24 * 3600 * 1000;
    let value = Math.random() * 1000;
    for (var i = 0; i < 1000; i++) {
        data.push(randomData());
    }
    option = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                params = params[0];
                var date = new Date(params.name);
                return (
                    date.getDate() +
                    '/' +
                    (date.getMonth() + 1) +
                    '/' +
                    date.getFullYear() +
                    ' : ' +
                    params.value[1]
                );
            },
            axisPointer: {
                animation: false
            }
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                show: false
            }
        },
        series: [
            {
                name: 'Fake Data',
                type: 'line',
                showSymbol: false,
                data: data
            }
        ]
    };
    setInterval(function () {
        for (var i = 0; i < 5; i++) {
            data.shift();
            data.push(randomData());
        }
        myChart.setOption({
            series: [
                {
                    data: data
                }
            ]
        });
    }, 1000);
    myChart.setOption(option);
