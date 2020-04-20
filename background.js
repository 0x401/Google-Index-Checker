const googleUrl = "https://www.google.com/ncr";
const ip = ["72.14.190.106", "176.58.101.66", "103.3.61.241", "101.207.120.16"];
const geo = ["US", "UK", "SG", "联通"];
let googleTabId, data, dataIndex, stop, error, num, indexedNum, unIndexedNum;
function init() {
  googleTabId = -1;//google搜索页标签id
  data = [];//表格url
  dataIndex = -1;//当前url索引
  stop = true;//搜索是否进行
  error = false;//搜索是否错误
  num = 0;//表格编号
  indexedNum = 0;//收录数
  unIndexedNum = 0;//未收录数
  $("#total").text(num);
  $("#indexed").text(indexedNum);
  $("#unIndexed").text(unIndexedNum);
  updateLocation();
}
init();
//导入数据
function importTxt() {
  $("#file").trigger("click");
}
$("#file").on("change", function () {
  let file = $(this).prop('files')[0];
  console.log(file);
  let reader = new FileReader();
  reader.onload = function (e) {
    init();
    let list = e.target.result.split(/\n\r?/);
    $("#list>tbody").empty();
    $.each(list, function (i, value) {
      if (value.trim() != "") {
        num++;
        let url = $("#baseUrl").val() + value.trim();
        $("#list>tbody").append('<tr id="_' + i + '"><td>' + num + '</td><td class="url">' + value + '</td><td class="status"></td><!--<td class="page"></td>--></tr>');
        data[i] = url;
      }
    });
    $("#total").text(num);
  };
  if (file) {
    reader.readAsText(file);
  }


});
//导出数据
function exportTxt() {
  let list = $("#list>tbody>tr");
  let r = ["URL,Indexed\n"];
  for (var i = 0; i < list.length; i++) {
    if (list.children("td.status")[i].innerText != "") {
      r[i + 1] = list.children("td.url")[i].innerText + "," + list.children("td.status")[i].innerText + "\n";
    }
  }
  function errorHandler() {
    console.log('a');
  }
  chrome.fileSystem.chooseEntry({ type: 'saveFile', suggestedName: 'a.csv' }, function (writableFileEntry) {
    writableFileEntry.createWriter(function (writer) {
      writer.onerror = errorHandler;
      writer.onwriteend = function (e) {
        console.log('write complete');
      };
      writer.write(new Blob(r, { type: 'text/plain' }));
    }, errorHandler);
  });


}
//更新线路信息
function updateLocation() {
  $.getJSON('https://freegeoip.app/json/', function (data) {
    if (ip.indexOf(data.ip) > -1) {
      $("#location").text(geo[ip.indexOf(data.ip)]);
    } else {
      $("#location").text(data.country_code);
    }
  });
}

$("body").on('click', '#import', importTxt);
$("body").on('click', '#export', exportTxt);
$("body").on('click', '#stop', function () {
  stop = true;
  $("#stop").prop({ "id": "check", "value": "Check" });
});
$("body").on('click', '#check', function () {
  if (data.length==0) {
    updateTip('请导入数据');
    return;
  }
  stop = false;
  $("#check").prop({ "id": "stop", "value": "Stop" });
  if (googleTabId == -1) {//第一次搜索
    chrome.tabs.create({ url: googleUrl, active: false, selected: false }, function (tab) {
      googleTabId = tab.id;
      updateTip("正在打开 Google 搜索页");
    });
  } else {
    search(dataIndex);
  }
});
//更新提示
function updateTip(tip) {
  $("#tip").text(tip);
}
//更新搜索结果
function updateStatus(index, status) {
  //console.log('更新结果：' + index);
  updateTip("更新结果到表格：" + data[index]);
  let statusEle = $("#_" + index).children(".status");
  switch (status) {
    case -2:
      statusEle.removeClass().addClass("status is-loading is-success has-text-centered").text("Testing");
      break;
    case -1:
      statusEle.removeClass().addClass("status is-warning has-text-centered").text("ERROR");
      break;
    case 0:
      statusEle.removeClass().addClass("status is-danger has-text-centered no").text("NO");
      unIndexedNum++;
      $("#unIndexed").text($(".no").length);
      break;
    case 1:
      statusEle.removeClass().addClass("status is-success has-text-centered yes").text("YES");
      indexedNum++;
      $("#indexed").text($(".yes").length);
      break;
  }
}
//发送搜索请求
function search(index) {
  //console.log('请求搜索：' + index+':'+data[index]);
  chrome.tabs.sendMessage(googleTabId, { q: "site:" + data[index] }, function (response) {
    updateTip("正在搜索：" + data[index]);
    updateStatus(index, response.status);
  });

}
//获取搜索结果
function getSearchResult(index) {
  //console.log('请求获取结果：' + index);
  updateTip("正在获取结果：" + data[index]);
  chrome.tabs.sendMessage(googleTabId, { g: true }, function (response) {
    //console.log(response);
    updateStatus(index, response.status);
    //进入下一次搜索
    dataIndex+=1;
    if (dataIndex<data.length) {
      if(!stop){
        console.log(dataIndex);
        search(dataIndex);
      }
    } else {
      updateTip('处理完成');
      stop= true;
      $("#stop").prop({ "id": "check", "value": "Check" });
    };
  });
}
//监听标签状态
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (googleTabId != -1 && tabId == googleTabId && info.status == 'complete') {//监听Google搜索页标签状态
    let url = new URL(tab.url);
    switch (url.pathname) {
      case '/sorry'://验证码页面
        updateTip('搜索失败，请完成验证');
        break;
      case '/search'://正常搜索页面
        getSearchResult(dataIndex);
        break;
      default:
        if (dataIndex == -1) {//开始第一次搜索
          dataIndex += 1;
          search(dataIndex);
        }
    }
  }
})