var myChart = echarts.init(document.querySelector('.box'));
var maxSeriesLength = 20;
var data = [];

$(function (){
    // 绑定点击 PredictBatchSize 事件
    PredictBatchSize();
    // 获取补全模型列表
    PredictModelSelect();
    // Task
    Task();
    // 保存任务配置
    TaskSetSave();
    // 初始化图表
    initChart();

})

function PredictBatchSize(){
    $('#PredictBatch a').click(function(){
        $('#PredictBatchSize').html($(this).text() + ' <span class="caret"></span>');
    });
}

function PredictModelSelect() {
    var data = {
        models: ["Model 1", "Model 2", "Model 3", "Model 4"]
    };

    var selectList = $('#TrainPredictModel');

    $.each(data.models, function(i, model) {
        var listItem = $('<li><label><input type="radio" name="models" value="' + model + '">' + model + '</label></li>');
        listItem.on('click', function() {
            var selectedModel = $(this).text();
            $('#PredictModel').text(selectedModel);
        });
        selectList.append(listItem);
    });
}

function Task() {
    let intervalId;
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

        if(data.hasOwnProperty("impute_data")) {
             // 更新图表数据
             updateChart(data.impute_data);
        }

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
    document.getElementById('TaskSaveToggle').addEventListener('change', (event) => {
        if (event.target.checked) {
            const fetchParams = () => ({
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

function initChart(){
    option = {

        title: {
            text: ''
        },

        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                const date = params[0].name.split("_")[0];
                return (
                    date +
                    ' : ' +
                    params[0].value[1]
                );
            },
            axisPointer: {
                animation: false
            }
        },

        xAxis: {
            type: 'category',
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
        series: []
    };
    myChart.setOption(option);
}


// 更新图表与异常标记
function updateChart(new_data) {
    const isAnomaly = new_data.anomaly_detection.anomaly;  // anomaly标记
    var seriesCount = new_data.impute_data.value.length;   // 获取系列数量 即 figures 数量

    //  data={
    //        "impute_data": {'index' : 10 , 'value': [f1, f2, f3, ...]},
    //         "anomaly_detection": {'anomaly': True, 'reason': 'some reason'} or  {'anomaly': False, 'reason': None}
    //          }

    while(option.series.length < seriesCount) {
        option.series.push({ data: [] });
    }

    new_data.impute_data.value.forEach((value, i) => {
        var dataPoint = {
            name: new_data.impute_data.index.toString(),  // 索引
            value: [
                new_data.impute_data.index,
                value
            ],
            itemStyle: {
                color: isAnomaly ? 'red' : 'blue'
            },
            label: {
                show: isAnomaly,
                formatter: new_data.anomaly_detection.reason // 异常原因
            }

        };

        // 当前的figure对应的系列series已经到最大存储量，删除最早的数据点
        if(option.series[i].data.length >= maxSeriesLength) {
            option.series[i].data.shift();
        }

        // 添加新的数据点到相应的figure系列
        option.series[i].data.push(dataPoint);
    });

    // 更新图表
    myChart.setOption(option);
}