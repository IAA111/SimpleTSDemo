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
    $("#StartTrainToggle").change(function (){
        if(this.checked){
         $.ajax({
                url: '/start/train/',
                type: 'POST',
                success: function() {
                   console.log("start success");
                },
                error: function() {
                     console.log("error");
                }
            });
        }
        else{
         $.ajax({
                url: '/stop/train/',
                type: 'POST',
                success: function() {
                   console.log("stop success");
                },
                error: function() {
                     console.log("error");
                }
            });
        }

    });
}