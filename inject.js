
// let url =location.href;
// if (url.includes("/sorry/")) {
//   status = -1;
// } else if(url.includes("&q=")) {
//   let keywords = [
//     "did not match any documents",
//     "No results found for",
//     "未找到符合",
//     "找不到和您查询的",
//     "に一致する結果は見つかりませんでした",
//     "との一致はありません"
//   ];
//   let topStuff = document.querySelector("#topstuff").innerText;
//   //判断是否包含关键词
//   if (keywords.some(v => topStuff.includes(v))) {
//     status = 1;
//   }
// }else{
//    status =0;
// }
let status = -2;
chrome.runtime.onMessage.addListener(function (request, sender,sendResponse){ 
  //处理搜索请求
  if(request.q){
    //sendResponse({ msg: 'ok'});
    sendResponse({ status: status});
    document.querySelector('input[title="Search"]').value=request.q;
    document.querySelector('[aria-label="Google Search"]').click();
    
  }
  //处理获取搜索结果请求
  if(request.g){
    let keywords = [
      "did not match any documents",
      "No results found for",
      "未找到符合",
      "找不到和您查询的",
      "に一致する結果は見つかりませんでした",
      "との一致はありません"
    ];
    let topStuff = document.querySelector("#topstuff").innerText;
    //判断是否包含关键词
    let status;
    if (keywords.some(v => topStuff.includes(v))) {
      status = 0;
    }else{
      status = 1;
    }
    sendResponse({ status: status});
  }

});


