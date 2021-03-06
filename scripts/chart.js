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
    for(var i = 0;i<csvarry.length-1;i++){
        var data = [];
        var temp = csvarry[i].split(",");
        for(var j = 0;j<temp.length;j++){
            data[j] = parseFloat(temp[j]);
        }
        data[2] = (data[2]+1.5)*0.45;
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
 * ????????????
 * @param type  scatter, line, bar
 * @param i  1,2,3 ????????????committer, repo ?????? commit time info
 * @param name committer
 * @param granularity day week month
 * @param data
 * @param committerType ????????????
 */
function loadChart(type, infoCategory, name, granularity, committerType){
    let chart= document.getElementById('chart1');
    echarts.init(chart).dispose();
    let myChart = echarts.init(chart);
    var option;
    // console.log(sourceData);
    option = {
        title: [{
            text: "?????????????????????",
            left: "435px",
            top:20,
            textStyle: {
                color: "#999",
                fontSize: 12,
                fontWeight: '400'
            }
        }, {
            text: "???????????????",
            right: "80px",
            top: 315,
            textStyle: {
                color: "#999",
                fontSize: 12,
                fontWeight: '400'
            }
        }],
        grid: {
            left: '3%',
            right: '15%',
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
                    width: 4
                }
            }
        },
        visualMap: {
            min: 20140101,
            max: 20210930,
            calculable: true,
            itemHeight:500,
            color:['#A12719','#FFFBFC'],
            orient: 'vertical',
            right: '10',
            splitNumber: 8,
            seriesIndex:1,
            top: 'center'
        },
        // toolbox: {
        //     feature: {
        //         dataZoom: {},
        //         brush: {
        //             type: ['rect', 'polygon', 'clear']
        //         }
        //     }
        // },
        // brush: {
        // },
        legend: {
            data: ['Developer Behavior'],
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
                    show: true,
                    lineStyle: {
                        color: ['gray'],
                        width: 0.1,
                        type: 'solid'
                    }
                },
                axisLine:{
                    lineStyle:{
                        width: 3
                    }
                },
                min: -1,
                max: 1
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
                    show: true,
                    lineStyle: {
                        color: ['gray'],
                        width: 0.1,
                        type: 'solid'
                    }
                },
                axisLine:{
                  lineStyle:{
                      width: 3
                  }
                },
                min: -1,
                max: 1
            }
        ],
        series: [
            {
                name: 'Developer Behavior',
                type: 'scatter',
                emphasis: {
                    focus: 'series'
                },
                blendMode: 'source-over',
                data: sourceData,
                dimensions: ['x', 'y'],
                markArea: {
                    silent: true,
                    itemStyle: {
                        color: 'transparent',
                        borderWidth: 0,
                        borderType: 'dashed',
                        itemStyle: {
                            opacity: 0.5
                        }
                    },
                    data: [[{
                        name: '',
                        xAxis: 'min',
                        yAxis: 'min'
                    }, {
                        xAxis: 'max',
                        yAxis: 'max'
                    }]]
                },
                // markPoint: {
                //     data: [
                //         {type: 'max', name: 'Max'},
                //         {type: 'min', name: 'Min'}
                //     ]
                // },
                // markLine: {
                //     lineStyle: {
                //         type: 'solid'
                //     },
                //     data: [
                //         {type: 'average', name: '?????????'},
                //         { xAxis: 160 }
                //     ]
                // },
                symbolSize: 9,
                itemStyle: {
                    color: function(e){
                        // console.log(e)
                        return 'rgb(161,39,25,'+e.value[2]+')';
                    }
                }
            }
            // {
            //     name: 'Developer2',
            //     type: 'scatter',
            //     emphasis: {
            //         focus: 'series'
            //     },
            //     blendMode: 'source-over',
            //     data: sourceData2,
            //     dimensions: ['x', 'y'],
            //     markArea: {
            //         silent: true,
            //         itemStyle: {
            //             color: 'transparent',
            //             borderWidth: 0,
            //             borderType: 'dashed',
            //             itemStyle: {
            //                 opacity: 0.5
            //             }
            //         },
            //         data: [[{
            //             name: '',
            //             xAxis: 'min',
            //             yAxis: 'min'
            //         }, {
            //             xAxis: 'max',
            //             yAxis: 'max'
            //         }]]
            //     },
            //     // markPoint: {
            //     //     data: [
            //     //         {type: 'max', name: 'Max'},
            //     //         {type: 'min', name: 'Min'}
            //     //     ]
            //     // },
            //     // markLine: {
            //     //     lineStyle: {
            //     //         type: 'solid'
            //     //     },
            //     //     data: [
            //     //         {type: 'average', name: '?????????'},
            //     //         { xAxis: 160 }
            //     //     ]
            //     // },
            //     symbolSize: 10,
            //     itemStyle: {
            //         color: function(e){
            //             return 'rgb(98,187,193,'+e.value[2]+')';
            //         }
            //     },
            // }
        ]
    };

    // ???????????????????????????????????????????????????
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
    // ?????????????????????????????????
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
            axisPointer: { // ??????????????????????????????????????????
                type: 'shadow' // ??????????????????????????????'line' | 'shadow'
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
            //orient: 'vertical',//?????????????????????????????????
            x: 'center',
            y: '10',
            feature: {
                dataZoom: {
                    yAxisIndex: false
                },
                dataView: { //????????????
                    show: false,
                    readOnly: true
                },
                magicType: { //??????????????????
                    show: false,
                    type: ['scatter','line', 'bar']
                    //      ??????,  ??????,  ??????
                },
                restore: { //??????
                    show: false
                }
            },
            iconStyle: {
                normal: {
                    color: 'white', //??????????????????
                },
                emphasis: { //?????????????????????
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
            data: xAxis,
            splitLine: {
                show: true,
                lineStyle: {
                    color: ['gray'],
                    width: 2,
                    type: 'solid'
                }
            }
        }],
        yAxis: [{
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
            splitLine: {
                show: true,
                lineStyle: {
                    color: ['gray'],
                    width: 2,
                    type: 'solid'
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
                        show: false, //?????????
                        position: 'top', //???????????????
                        textStyle: { //????????????
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
                        show: false, //?????????
                        position: 'top', //???????????????
                        textStyle: { //????????????
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
                        show: false, //?????????
                        position: 'top', //???????????????
                        textStyle: { //????????????
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
                        show: false, //?????????
                        position: 'top', //???????????????
                        textStyle: { //????????????
                            color: 'black',
                            fontSize: 12
                        }
                    }
                }
            }
        }]
    };

    // ???????????????????????????????????????????????????
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
