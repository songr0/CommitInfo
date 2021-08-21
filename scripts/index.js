const baseUrl= "http://10.176.34.85:8000";

let tabs = document.getElementsByClassName('tab-head')[0].getElementsByTagName('button');
let control_type= document.getElementById("control_type");
let selectID = document.getElementById("pid");
let selectRepo= document.getElementById("control_repo");
let infoCategory= "committer";
getRepos();

$("#pid").change(function(e){
    reSetChart();
});

$("#control_type").change(function (e) {
    reSetChart();
});

$("#control_time").change(function (e) {
    reSetChart();
});

$("#control_chart_type").change(function (e) {
    reSetChart();
});

$("#control_repo").change(function (e) {
    const newCommitters= getCommitters($("#control_repo").val());
    let childs= selectID.childNodes;
    for(let i = childs .length - 1; i >= 0; i--) {
        selectID.removeChild(childs[i]);
    }
    for(let j= 0;j< newCommitters.length;j++){
        let option = document.createElement("option");// 创建option元素
        option.appendChild(document.createTextNode(newCommitters[j]));
        option.setAttribute("value", newCommitters[j]);
        selectID.appendChild(option);
    }
    reSetChart();
});

$("#control_repo_type").change(function (e) {
    reSetChart();
})

for(let i= 0;i< committerTypes.length;i++){
    let option = document.createElement("option");// 创建option元素
    option.appendChild(document.createTextNode(committerTypes[i]));
    option.setAttribute("value", committerTypes[i]);
    control_type.appendChild(option);
}

(function changeTab(tab) {
    for(let i = 0, len = tabs.length; i < len; i++) {
        tabs[i].onclick = showTab;
    }
})();

function showTab() {
    for(let i = 0, len = tabs.length; i < len; i++) {
        let content2= document.getElementById("control"+(i+1));
        if(tabs[i] === this) {
            tabs[i].className = 'selected';
            content2.className= 'show';
            if(i === 2){
                infoCategory= "committer";
            }else if(i === 1){
                infoCategory= "repo";
            }else{
                infoCategory= "commit_time";
            }
        } else {
            tabs[i].className = 'not-selected';
            content2.className= 'hide-chart';
        }
    }
    reSetChart();
}

function reSetChart() {
    let committerData;
    if(infoCategory=== "committer"){
        committerData= getCommitterData($("#pid").val(), $("#control_time").val(), $("#control_repo").val());
        loadChart($("#control_chart_type").val(), infoCategory,  $("#pid").val(), $("#control_time").val(), committerData, $("#control_type").val());
    }else if(infoCategory=== "repo"){
        getRepoData();
    }else {
        getCommitInfoData();
    }
}

function getRepos(){
    const url= baseUrl+ "/commit/repo";
    let data= [];
    $.ajax({
        url: url,
        async : false,
        success: (d)=>{
            if(d.data){
                for(let i= 0;i< d.data.length;i++){
                    data.push(d.data[i].repoId);
                }
            }
        }
    });

    const committers= getCommitters(data[0]);
    
    for(let m=0; m< data.length; m++){
        let option = document.createElement("option");// 创建option元素
        option.appendChild(document.createTextNode(data[m]));
        option.setAttribute("value", data[m]);
        selectRepo.appendChild(option);
    }
    
    for(let j= 0;j< committers.length;j++){
        let option = document.createElement("option");// 创建option元素
        option.appendChild(document.createTextNode(committers[j]));
        option.setAttribute("value", committers[j]);
        selectID.appendChild(option);
    }
}

function getCommitters(repo) {
    const url= baseUrl+ "/commit/committerName/"+ repo;
    let committers= [];
    $.ajax({
        url: url,
        async : false,
        success: (d)=>{
            if(d.data){
                const len= d.data.length;
                for(let i= 0;i< len;i++){
                    committers.push(d.data[i].committerName);
                }
            }
        }
    })
    return committers;
}




