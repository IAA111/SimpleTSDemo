var data = [];

$(function (){
    // 绑定点击 PredictBatchSize 事件
    PredictWindowSize();
    // 获取补全模型列表
    ImputeModelSelect();
    //获取预测模型列表
    PredictModelSelect();
    // Task
    Task();
    // 保存任务配置
    TaskSetSave();
    // 初始化缺失率饼图
    initMissingRateChart();
    // 初始化异常率饼图
    initAnomalyRateChart();
    // 获取表格数据
    ShowTaskResults();
    // 点击 details 按钮
    bindBtnDetails();
    // 保存 details 设置按钮
    bindBtnSaveDetails();
    initChart_on();
    updateChart_on();
    // 点击按钮变色
    clickbtncolor();
})

function PredictWindowSize(){
    $('#PredictWindowSize a').click(function(){
        $('#BtnPredictWindowSize').html($(this).text() + ' <span class="caret"></span>');
    });
}

function ImputeModelSelect() {
    var data = {
        models: ["OT","global best"]
    };

    var selectList = $('#ImputeModelSelect');

    $.each(data.models, function(i, model) {
        var listItem = $('<li><label><input type="radio" name="models" value="' + model + '">' + model + '</label></li>');
        listItem.on('click', function() {
            var selectedModel = $(this).text();
            $('#ImputeModel').text(selectedModel);
        });
        selectList.append(listItem);
    });
}

function PredictModelSelect() {
    var data = {
        models: ["Transformer","NBeats","NPTS","ARIMA","Holt-Winters","global best"]
    };

    var selectList = $('#PredictModelSelect');

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
    var chartControl_missing = initMissingRateChart();

    socket.onopen = function (e){
        console.log("Connection open");
    };

    document.getElementById('taskToggle').addEventListener('change', (event) => {
      if (event.target.checked) {
        document.getElementById('click-trigger').className = 'glyphicon glyphicon-record processing-color';
        socket.send(JSON.stringify({"type": "task.start"}));
      } else {
        socket.send(JSON.stringify({"type": "task.stop"}));
        document.getElementById('click-trigger').className = 'glyphicon glyphicon-record default-color';
        document.getElementById('predict').className = 'glyphicon glyphicon-record default-color';
        document.getElementById('finished').className = 'glyphicon glyphicon-record default-color';
        document.getElementById("Status").textContent = "Stopped"
        clearInterval(intervalId);
      }
    });

    socket.onmessage = function(event){
        console.log(`return message:${event.data}`);
        let data = JSON.parse(event.data);

        if (data.status === "progressing") {
            document.getElementById('predict').className = 'glyphicon glyphicon-record processing-color';
        } else if (data.status === "finished") {
            document.getElementById('finished').className = 'glyphicon glyphicon-record processing-color';
            clearInterval(intervalId);
        }

        if(data.hasOwnProperty("impute_data")) {
             // 更新图表数据
             chartControl_missing.updateChart(data.impute_data);
        }

        let start_time = new Date(data.start_time * 1000);
        document.getElementById("Status").textContent = data.status;

        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(() => {
            updateTaskTime(start_time);
        }, 1000);

    }

    function updateTaskTime(StartTime) {
    let currentTime = new Date();
    if (document.getElementById("Status").textContent !== "finished") {
        let Time = parseInt((currentTime - StartTime) / 1000);
        let formattedImputeTime = formatTime(Time);
        document.getElementById("TaskTime").textContent = formattedImputeTime;
    }

}

// 将获得的秒数转换为 HH:MM:SS 格式
    function formatTime(seconds) {
        let hours = parseInt(seconds / 3600);
        let minutes = parseInt((seconds % 3600) / 60);
        let remainingSeconds = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`Connection closed properly：${event.code},${event.reason}`);
        } else {
            console.log('disconnect');
        }
        clearInterval(intervalId);
    };

    socket.onerror = function(error) {
        console.log(`[error] ${error.message}`);
    };
}

function TaskSetSave() {
  document.getElementById('TaskSaveToggle').addEventListener('click', (event) => {
    const fetchParams = () => ({
      ImputeModel: $('#ImputeModel').text(),
      PredictModel: $('#PredictModel').text(),
      PredictWindowSize: $('#BtnPredictWindowSize').text().trim()
    });

    const params = fetchParams();

    $.ajax({
      type: "POST",
      url: "/task/save/",
      contentType: "application/json",
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
  });
}

function initMissingRateChart(){
    var myChart2 = echarts.init(document.getElementById('missing_rate_chart'));
    option = {
  title: {
    text: 'missing_rate_chart',
    left: 'center',
    top: '14%'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
       top: '1%',
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: 'complete data' },
        { value: 23, name: 'missing data' },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
    }
  ]
};
    myChart2.setOption(option);
}

     /*
    myChart2.setOption(option);
    function updateChart(data) {
        var pieData = Object.entries(data).map(([key, value]) => ({name: key, value: value}));

        myChart2.setOption({
            series: [{
                data: pieData
            }]
        });
    }
    return {
        updateChart: updateChart
    };
}
 */


function initAnomalyRateChart(){
    var myChart3 = echarts.init(document.getElementById('anomaly_rate_chart'));
    option = {
  title: {
    text: 'anomaly_rate_chart',
    left: 'center',
    top: '18%'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
       top: '1%',
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 10, name: 'Large concurrency' },
        { value: 39, name: 'Out of memory' },
        { value: 58, name: 'Lock race' },
        { value: 44, name: 'Network delay' },
        { value: 7, name: 'Index failure' },
        { value: 32, name: 'Complex query' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
    }
  ]
};
    myChart3.setOption(option);
}

function ShowTaskResults(){
    $(document).on('click', '.pagination1 a', function (e) {
        e.preventDefault();
        var page = $(this).data('page');
        $.ajax({
            url: '/load_impute_results/',  // Set this URL to load impute results data
            data: {'page': page},
            method: 'GET',
            success: function (data) {
                $('#impute-results-table').html(data.html);  // Update the impute results table
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    });

    $(document).on('click', '.pagination2 a', function (e) {  // Add a new handler for the second table
        e.preventDefault();

        var page = $(this).data('page');

        $.ajax({
            url: '/load_anomaly_results/',  // Set this URL to load anomaly results data
            data: {'page': page},
            method: 'GET',
            success: function (data) {
                $('#Anomaly-results-table').html(data.html);  // Update the anomaly results table
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    });

    $('#impute-results-table').on('submit', 'form', function(e) {
        e.preventDefault();
        var page = $("input[name='page']", this).val();

        $.ajax({
            url: '/load_impute_results/',  // Set this URL to load impute results data
            type: 'GET',
            data: {'page': page},
            success: function (data) {
                $('#impute-results-table').html(data.html);
            }
        });
    });

    $('#Anomaly-results-table').on('submit', 'form', function(e) {
        e.preventDefault();
        var page = $("input[name='page']", this).val();

        $.ajax({
            url: '/load_anomaly_results/',
            type: 'GET',
            data: {'page': page},
            success: function (data) {
                $('#Anomaly-results-table').html(data.html);
            }
        });
    });
}

function bindBtnDetails() {
    $(".btn-edit").click(function () {
        //清空对话框中的数据
        $('#formAdd')[0].reset();
        var currentId = $(this).attr('uid');
        EDIT_ID = currentId;
        $("#myModal").modal('show');
        $.ajax({
            url: "/get/analysis/",
            type: 'GET',
            data: {uid: currentId},
            dataType: "JSON",
            success: function (data) {
                if(data.status == 'ERROR'){
                    alert('Error: ' + data.error);
                } else {
                    $("#analysisInput").val(data.analysis);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //服务器连接失败时的处理
                alert('Failed to connect to server: ' + textStatus);
            }
        });
    })
}

function bindBtnSaveDetails(){
    $("#btnSave").click(function () {
    $.ajax({
        url: "/save/analysis/",
        type: 'POST',
        data: {
            uid: EDIT_ID,
            analysis: $("#analysisInput").val()
        },
        dataType: "JSON",
        success: function (data) {
            if(data.status == 'OK'){
                alert('Saved successfully');
                $("#myModal").modal('hide'); // 关闭模态框
            } else {
                alert('Failed to save: ' + data.error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Failed to connect to server: ' + textStatus);
        }
    });
})
}

// 初始化图表
var current_index = 0;
var myChart1 = echarts.init(document.getElementById('main'));
var maxSeriesLength = 20;
var option = null;
var colors = ["#488f31", "#59cdaa", "#1b9be0", "#56428e", "#9c56b8", "#c23b75", "#ec2176", "#f03867", "#f66f4b", "#fca443", "#f3d72b", "#9edb40", "#30c16f", "#179f8c", "#147f9f", "#4986b5", "#7278a6", "#a066ab"];

function initChart_on(){
    option = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
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
            },
            max: 'dataMax',
        },
        series: [],
        legend: {},
        animationDurationUpdate: 0,
    };
    myChart1.setOption(option);
}

function updateChart_on() {
    $.ajax({
        url: "/get_chart_predata/",
        type: "GET",
        dataType: "json",
        success: function (res) {
            if(current_index < res.length) {  // 如果还有数据可获取
                var new_data = res[current_index];  // 获取一个数据点，而不是整个列表
                process_data(new_data);
                current_index++;  // 更新当前索引
            }
        }
    });
}

function process_data(newData) {
    var figureCount = newData.figures.length;

    while (option.series.length < figureCount * 2) {
        var figureNumber = Math.floor(option.series.length / 2);
        var isPredicted = option.series.length % 2 == 1;
        var color = colors[figureNumber % colors.length];
        var seriesName = 'Variable ' + (figureNumber + 1) + (isPredicted ? ' Predicted' : '');
        option.series.push({
            data: [],
            type: 'line',
            markPoint: {
                data: []
            },
            showSymbol: false,
             name: isPredicted ? '' : seriesName,
            lineStyle: isPredicted ? { type: 'dashed' } : {},
            itemStyle: { color: color }
        });

    }

    newData.figures.forEach((value, i) => {
        if (option.series[i * 2].data.length >= maxSeriesLength) {
            option.series[i * 2].data.shift();
            if(option.series[i * 2].markPoint.data.length > 0){
                if (option.series[i * 2].markPoint.data[0].coord[0] <= newData.time - maxSeriesLength) {
                    option.series[i * 2].markPoint.data.shift();
                }
            }
        }

        var dataPoint = {
            name: newData.time,
            value: [newData.time, value],
        };

        option.series[i * 2].data.push(dataPoint);

        if(newData.predicted_figures[i] !== null) {
            if(option.series[i * 2 + 1].data.length >= maxSeriesLength) {
                option.series[i * 2 + 1].data.shift();
                if(option.series[i * 2 + 1].markPoint.data.length > 0){
                    if (option.series[i * 2 + 1].markPoint.data[0].coord[0] <= newData.time - maxSeriesLength) {
                        option.series[i * 2 + 1].markPoint.data.shift();
                    }
                }
            }

            var predictedDataPoint = {
                name: newData.time,
                value: [newData.time, newData.predicted_figures[i]],
            };

            option.series[i * 2 + 1].data.push(predictedDataPoint);
        }


        if (newData.highlighted_figures[i] !== null) {
            var markPoint = {
                coord: [newData.time, value],
                symbol: 'circle',
                symbolSize: 20,
                label: { show: false },
                animation: false,
                animationDurationUpdate: 0,
                itemStyle: { color: 'yellow' },
            };
            option.series[i * 2].markPoint.data.push(markPoint);
        }

        if (newData.highlighted_predicted_figures[i] !== null && newData.predicted_figures[i] !== null) {
            var markPoint = {
                coord: [newData.time, newData.predicted_figures[i]],
                symbol: 'circle',
                symbolSize: 20,
                label: { show: false },
                animation: false ,
                animationDurationUpdate: 0,
                itemStyle: { color: 'red' },
            };
            option.series[i * 2 + 1].markPoint.data.push(markPoint);
        }
    });

    myChart1.setOption({
        series: option.series,
        xAxis: {
            min: 'dataMin',
            max: 'dataMax'
        }
    });
}

setInterval(updateChart_on, 300);


function clickbtncolor(){
    $(".btn-group-xs .btn").click(function(){
        // 先重置所有按钮的颜色
        $(".btn-group-xs .btn").removeClass("btn-selected");
        $(".btn-group-xs .btn").addClass("btn-default");

        // 为选中的按钮添加新样式
        $(this).removeClass("btn-default");
        $(this).addClass("btn-selected");
    });
}


$(document).ready(function(){
    $("#taskToggle").change(function() {

    });
});