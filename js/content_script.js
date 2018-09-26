$(document).ready(function(){
  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.greeting == "first"){
        var res = sendURL(request.options);
        // response（URL配列）をbackgroundに送る
        sendResponse(res);
      } else if(request.greeting == "second"){
        // backgroundから容量が返ってきたら、実行
        init(request.options,request.size);
      } else {
        // レスポンスがない場合でも、必ず空のオブジェクトを返す。
        sendResponse({}); // snub them.
      }
      
    }
  );
});

function convertAbsUrl(relativePath){
  var anchor = document.createElement("a");
  anchor.href = relativePath;
  return anchor.href;
}

function sendURL(option){
  var o = $.extend({
    target: 'a[href$=".pdf"],a[href$=".xls"],a[href$=".xlsx"]',
    notation_KB: "01",
    notation_MB: "01",
    math_kb: 2,
    math_mb: 2
  },option);
  
  var $target = $(o.target);
  
  if($target.length === 0){
    alert("チェック対象がありませんでした。");
    return false;
  }
  
  var responseMsg = [];
  
  $target.each(function(index){
    var self = $(this);
    self.addClass("add-ons-highlight");
    self.append('<div class="add-ons-loading">Loading...</div>');
    var url = convertAbsUrl(self.attr("href"));
    
    self.attr("data-addons-id",index);
    
    responseMsg[index] = url;
    
  });
  return {"result":responseMsg};
  
}

function init(option,sizeArr){
  var o = $.extend({
    target: 'a[href$=".pdf"],a[href$=".xls"],a[href$=".xlsx"]',
    notation_KB: "01",
    notation_MB: "01",
    math_kb: 2,
    math_mb: 2
  },option);
  
  var $target = $('[data-addons-id]');
  
  var round2nd = function(int,p){
    p = p - 1;
    var m = Math.pow(10,p);
    return Math.round(int * m) / m;
  };
  var floor2nd = function(int,p){
    p = p - 1;
    var m = Math.pow(10,p);
    return Math.floor(int * m) / m;
  };
  
  // 容量変換関数
  var convertSize = function(size){
    var byte = "byte";
    if(size > 1024){
      // KB変換
      size /= 1024;
      byte = "KB";
      if(size > 1024){
        // MB変換
        size /= 1024;
        byte = "MB";
      }
      // 小数点第3位以降削除
      size = Math.floor(size * 100) / 100;
      
      //小数点オプション
      switch(byte){
        case "KB":
          if(o.notation_KB === "02"){
            size = round2nd(size,o.math_kb);
          } else if(o.notation_KB === "03"){
            size = floor2nd(size,o.math_kb);
          }
          break;
        case "MB":
          if(o.notation_MB === "02"){
            size = round2nd(size,o.math_mb);
          } else if(o.notation_MB === "03"){
            size = floor2nd(size,o.math_mb);
          }
          break;
        default:
          break;
      }
    }
    return (size + " " + byte);
  };
  
  for(var i = 0; i < sizeArr.length; i++){
    var self = $target.eq(i);
    var size = sizeArr[i];
    self.find(".add-ons-loading").remove();
    
    if(size.indexOf("Error") !== -1){
      self.append('<div class="add-ons-status">' + sizeArr[i].replace("Error","") + '</div>');
    } else if(size === "20" || size === null){
      self.append('<div class="add-ons-status">No response...</div>');
    } else {
      var v = convertSize(size);
      self.append('<div class="add-ons-size">' + v + '</div>');
    }
  }
  
}