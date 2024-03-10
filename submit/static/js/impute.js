$(function (){
    // 绑定点击 PredictBatchSize 事件
    PredictBatchSize();
    // 获取补全模型列表
    ModelSelect();



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