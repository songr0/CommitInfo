$(function(){
    let committerData;
    loadChart($("#control_chart_type").val(), infoCategory,  $("#pid").val(), $("#control_time").val(), $("#control_type").val());
    // if(infoCategory=== "committer"){
    //     committerData= getCommitterData($("#pid").val(), $("#control_time").val(), $("#control_repo").val());
    //     loadChart($("#control_chart_type").val(), infoCategory,  $("#pid").val(), $("#control_time").val(), committerData, $("#control_type").val());
    // }else if(infoCategory=== "repo"){
    //     getRepoData();
    // }else {
    //     getCommitInfoData();
    // }
})

function getCommitterData(name, granularity, repo){
    let url, chartData= {
        add_files: [],
        add_lines: [],
        change_files: [],
        copy_files: [],
        delete_files: [],
        rename_files: [],
        delete_lines: [],
        weekStart: [],
        days: []
    };
    if(granularity === "day"){
        url= baseUrl+ "/commit/committerDay/"+ repo+ "/"+ name;
    }else if(granularity === "week"){
        url= baseUrl+ "/commit/committerWeek/"+ repo+ "/"+ name;
    }
    $.ajax({
        url: url,
        async : false,
        success: (iData) => {
            if(iData.data){
                const len= iData.data.length;
                for(let i=0; i<len; i++){
                    chartData.add_files.push(iData.data[i].add_files);
                    chartData.add_lines.push(iData.data[i].add_lines);
                    chartData.change_files.push(iData.data[i].change_files);
                    chartData.copy_files.push(iData.data[i].copy_files);
                    chartData.delete_files.push(iData.data[i].delete_files);
                    chartData.delete_lines.push(iData.data[i].delete_lines);
                    chartData.rename_files.push(iData.data[i].rename_files);
                    if(iData.data[i].weekStart){
                        chartData.weekStart.push(iData.data[i].weekStart)
                    }
                    if(iData.data[i].days){
                        chartData.days.push(iData.data[i].days)
                    }
                }
            }
        }
    });
    return chartData;
}

function getRepoData(){
    let data= {
        avg: [], max: [], min: [], mid: []
    };
    let url;
    if($("#control_repo_type").val() === "lines"){
        url= baseUrl+ "/commit/repoCommitAnalysisLines/"+ $("#control_repo").val();
    }else {
        url= baseUrl+ "/commit/repoCommitAnalysisFiles/"+ $("#control_repo").val();
    }
    $.ajax({
        url: url,
        async : false,
        success: (d)=>{
            if(d.data){
                for(let i=0;i< d.data.length;i++){
                    let obj= d.data[i];
                    for(const key in obj){
                        if(key.indexOf("avg")!== -1){
                            data.avg.push(obj[key]);
                        }else if(key.indexOf("max") !== -1){
                            data.max.push(obj[key]);
                        }else if(key.indexOf("min") !== -1){
                            data.min.push(obj[key]);
                        }else {
                            data.mid.push(obj[key]);
                        }
                    }
                }
                loadChart2($("#control_chart_type").val(), infoCategory, data, $("#control_repo_type").val());
            }
        }
    })
}

function getCommitInfoData(){
    let infos= {
        key: [],
        value: []
    };
    const url= baseUrl+ "/commit/repoKeyWords/"+ $("#control_repo").val();
    $.ajax({
        url: url,
        async : false,
        success: (data)=>{
            if(data.data){
                for(let key in data.data){
                    infos.key.push(key);
                    infos.value.push(data.data[key]);
                }
            }
            loadChart($("#control_chart_type").val(), infoCategory,  $("#pid").val(), $("#control_time").val(), infos, $("#control_type").val())
        }
    })
}

function csvToObject(csvString){
    var csvarry = csvString.split("\r\n");
    var datas = [];
    for(var i = 1;i<csvarry.length;i++){
        var data = [];
        var temp = csvarry[i].split(",");
        for(var j = 0;j<temp.length;j++){
            data[j] = parseFloat(temp[j]);
        }
        datas.push(data);
    }
    return datas;
}

function FuncCSVInport() {
    $("#csvFileInput").val("");
    $("#csvFileInput").click();
}

let sourceData;

function readCSVFile1(obj) {
    var reader = new FileReader();
    reader.readAsText(obj.files[0]);
    reader.onload = function () {
        sourceData = csvToObject(this.result);
        loadChart(null, null, null, null);
    }
}

let sourceData2;
function readCSVFile2(obj) {
    var reader = new FileReader();
    reader.readAsText(obj.files[0]);
    reader.onload = function () {
        sourceData2 = csvToObject(this.result);
        loadChart(null, null, null, null);
    }
}

/**
 * 加载图表
 * @param type  scatter, line, bar
 * @param i  1,2,3 分别表示committer, repo 还是 commit time info
 * @param name committer
 * @param granularity day week month
 * @param data
 * @param committerType 数据类型
 */
function loadChart(type, infoCategory, name, granularity, committerType){
    let chart= document.getElementById('chart1');
    echarts.init(chart).dispose();
    let myChart = echarts.init(chart);
    var option;
    console.log(sourceData);
    option = {
        title: {
            text: 'method and class change distribution',
            subtext: 'Data from: Heinz 2003'
        },
        grid: {
            left: '3%',
            right: '7%',
            bottom: '7%',
            containLabel: true
        },
        tooltip: {
            // trigger: 'axis',
            showDelay: 0,
            formatter: function (params) {
                if (params.value.length > 1) {
                    return params.seriesName + ' :<br/>'
                        + params.value[0] + ' '
                        + params.value[1];
                }
            },
            axisPointer: {
                show: true,
                type: 'cross',
                lineStyle: {
                    type: 'dashed',
                    width: 1
                }
            }
        },
        toolbox: {
            feature: {
                dataZoom: {},
                brush: {
                    type: ['rect', 'polygon', 'clear']
                }
            }
        },
        brush: {
        },
        legend: {
            data: ['A', 'B'],
            left: 'center',
            bottom: 10
        },
        xAxis: [
            {
                type: 'value',
                scale: true,
                axisLabel: {
                    formatter: '{value}'
                },
                splitLine: {
                    show: false
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                scale: true,
                axisLabel: {
                    formatter: '{value}'
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name: 'A',
                type: 'scatter',
                emphasis: {
                    focus: 'series'
                },
                data: sourceData,
                markArea: {
                    silent: true,
                    itemStyle: {
                        color: 'transparent',
                        borderWidth: 1,
                        borderType: 'dashed'
                    },
                    data: [[{
                        name: 'A Data Range',
                        xAxis: 'min',
                        yAxis: 'min'
                    }, {
                        xAxis: 'max',
                        yAxis: 'max'
                    }]]
                },
                markPoint: {
                    data: [
                        {type: 'max', name: 'Max'},
                        {type: 'min', name: 'Min'}
                    ]
                },
                markLine: {
                    lineStyle: {
                        type: 'solid'
                    },
                    data: [
                        {type: 'average', name: '平均值'},
                        { xAxis: 160 }
                    ]
                },
                symbolSize: 5
            },
            {
                name: 'B',
                type: 'scatter',
                emphasis: {
                    focus: 'series'
                },
                data: sourceData2,
                markArea: {
                    silent: true,
                    itemStyle: {
                        color: 'transparent',
                        borderWidth: 1,
                        borderType: 'dashed'
                    },
                    data: [[{
                        name: 'B Data Range',
                        xAxis: 'min',
                        yAxis: 'min'
                    }, {
                        xAxis: 'max',
                        yAxis: 'max'
                    }]]
                },
                markPoint: {
                    data: [
                        {type: 'max', name: 'Max'},
                        {type: 'min', name: 'Min'}
                    ]
                },
                markLine: {
                    lineStyle: {
                        type: 'solid'
                    },
                    data: [
                        {type: 'average', name: 'Average'},
                        { xAxis: 170 }
                    ]
                },
                symbolSize: 5
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    function f() {
        let a=[];
        let i;
        for(i=0;i<3;i++){
            a[i]=function () {
                return i;
            }
        }
        return a;
    }
}

function loadChart2(type, infoCategory, data , committerType) {
    let chart= document.getElementById('chart1');
    echarts.init(chart).dispose();
    let myChart = echarts.init(chart);
    let xAxis= committerType === "lines"? ["add_lines","del_lines"]:
        ["add_files","change_files", "del_files", "copy_files", "rename_files"];
    // 指定图表的配置项和数据
    let option = {
        backgroundColor: 'white',
        color: ['#2ec7c9','#b6a2de',
            '#5ab1ef','#ffb980',
            '#d87a80', '#59678c',
            '#caffbf'],
        title: {
            text: "",
            x: 'left',
            y: 'top',
            textStyle: {
                fontWeight: 'normal',
                color: 'white',
                fontSize: 18
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        legend: {
            x: 'right',
            y: 'top',
            textStyle: {
                color: 'black',
                fontSize: 12
            },
            data: xAxis
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '11%',
            top: '16.5%',
            containLabel: true,
        },
        toolbox: {
            show: true,
            //orient: 'vertical',//默认是横向，这个是纵向
            x: 'center',
            y: '10',
            feature: {
                dataZoom: {
                    yAxisIndex: false
                },
                dataView: { //数据视图
                    show: false,
                    readOnly: true
                },
                magicType: { //动态类型切换
                    show: false,
                    type: ['scatter','line', 'bar']
                    //      折线,  柱状,  散点
                },
                restore: { //重置
                    show: false
                }
            },
            iconStyle: {
                normal: {
                    color: 'white', //设置图标颜色
                },
                emphasis: { //字体颜色及位置
                    color: 'black',
                    textPosition: 'bottom'
                }
            }
        },
        xAxis: [{
            type: 'category',
            axisTick: {
                alignWithLabel: true
            },
            axisLine: {
                lineStyle: {
                    color: 'black',
                }
            },
            axisLabel: {
                show: true,
                color: 'black',
                textStyle: {
                    fontSize: 12
                }
            },
            data: xAxis
        }],
        yAxis: [{
            splitLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'black',
                }
            },
            axisLabel: {
                color: 'black',
                formatter: '{value}',
                textStyle: {
                    fontSize: 12
                }
            },
            type: 'value'
        }],
        dataZoom: [{
            type: 'inside'
        }, {
            type: 'slider'
        }],
        series: [ {
            name: "avg",
            type: type,
            data: data.avg,
            // large: true,
            itemStyle: {
                normal: {
                    label: {
                        show: false, //不显示
                        position: 'top', //在上方显示
                        textStyle: { //数值样式
                            color: 'black',
                            fontSize: 12
                        }
                    }
                }
            }
        },{
            name: "max",
            type: type,
            data: data.max,
            // large: true,
            itemStyle: {
                normal: {
                    label: {
                        show: false, //不显示
                        position: 'top', //在上方显示
                        textStyle: { //数值样式
                            color: 'black',
                            fontSize: 12
                        }
                    }
                }
            }
        },{
            name: "min",
            type: type,
            data: data.min,
            // large: true,
            itemStyle: {
                normal: {
                    label: {
                        show: false, //不显示
                        position: 'top', //在上方显示
                        textStyle: { //数值样式
                            color: 'black',
                            fontSize: 12
                        }
                    }
                }
            }
        },{
            name: "mid",
            type: type,
            data: data.mid,
            // large: true,
            itemStyle: {
                normal: {
                    label: {
                        show: false, //不显示
                        position: 'top', //在上方显示
                        textStyle: { //数值样式
                            color: 'black',
                            fontSize: 12
                        }
                    }
                }
            }
        }]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    function f() {
        let a=[];
        let i;
        for(i=0;i<3;i++){
            a[i]=function () {
                return i;
            }
        }
        return a;
    }
}
