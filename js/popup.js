window.onload = function(){
  // 展開時、保存されている設定値の取得
  var defaults = {
    ids: ["pdf","xls","ppt","doc"],
    free: "",
    notation_KB: "01",
    notation_MB: "01",
    math_kb: 2,
    math_mb: 2
  };
  chrome.storage.sync.get(
    defaults,
    function(items) {
      for(var i = 0; i < items.ids.length; i++){
        $("#" + items.ids[i]).attr("checked",true);
      }
      
      // 設定出力
      optionDisp(items);
      // オプション初期値 更新
      $("#freeinput").val(items.free);
      $('#math_kb option[value="' + items.math_kb + '"]').attr("selected",true);
      $('[name="kb"][value="' + items.notation_KB + '"]').attr("checked",true);
      $('#math_mb option[value="' + items.math_mb + '"]').attr("selected",true);
      $('[name="mb"][value="' + items.notation_MB + '"]').attr("checked",true);
    }
  );
  
  // vars
  var helpActive = "help-active",
      optionActive = "option-active",
      $b = $("body"),
      $content = $("#container"),
      $option = $("#option"),
      $help = $("#help");
  
  var init = function(param){
    var ext = $('[name="ext"]:checked'),
        exts = [],
        ids = [],
        freeVal = $("#freeinput").val(),
        freeArr = freeVal.split(","),
        target,
        math_kb = $('#math_kb').val(),
        math_mb = $('#math_mb').val(),
        kb = $('[name="kb"]:checked').val(),
        mb = $('[name="mb"]:checked').val();
    
    math_kb = parseInt(math_kb);
    math_mb = parseInt(math_mb);
    
    for(var i = 0; i < ext.length; i++){
      exts.push(ext.eq(i).val());
      ids.push(ext.eq(i).attr("id"));
    }
    
    target = exts.join(",").split(",");
    
    for(var e = 0; e < target.length; e++){
      target[e] = "a[href$='." + target[e] + "']";
    }
    
    if(freeVal !== ""){
      for(var f = 0; f < freeArr.length; f++){
        target.push("a[href*='" + freeArr[f] + "']");
      }
    }
    
    target = target.join(",");
    
    var myOption = {
      ids: ids,
      free: freeVal,
      notation_KB: kb,
      notation_MB: mb,
      math_kb: math_kb,
      math_mb: math_mb
    };
    
    var sendOption = {
      target: target,
      notation_KB: kb,
      notation_MB: mb,
      math_kb: math_kb,
      math_mb: math_mb
    };
    
    // オプションをchrome.storageにset
    chrome.storage.sync.set(myOption, function(){});
    
    switch(param){
      case "go":
        return sendOption;
      case "set":
        return myOption;
    }
  };
  
  // 設定中オプションの出力
  var optionDisp = function(items){
    $("#cr-ids").text(items.ids);
    if(items.free !== ""){
      $("#cr-href").text("または、hrefに" + items.free + "を含むaタグ").show();
    } else {
      $("#cr-href").hide();
    }
    
    var t1,t2,n1,n2;
    
    switch(items.notation_KB){
      case "01":
        t1 = "まで表示";
        n1 = "2";
        break;
      case "02":
        t1 = "を四捨五入";
        n1 = items.math_kb;
        break;
      case "03":
        t1 = "を切り捨て";
        n1 = items.math_kb;
        break;
     }
    switch(items.notation_MB){
      case "01":
        t2 = "まで表示";
        n2 = "2";
        break;
      case "02":
        t2 = "を四捨五入";
        n2 = items.math_mb;
        break;
      case "03":
        t2 = "を切り捨て";
        n2 = items.math_mb;
        break;
     }
    
    $("#cr-kb").text("小数点第" + n1 + "位" + t1);
    $("#cr-mb").text("小数点第" + n2 + "位" + t2);
  };
  
  // ドロワー制御
  var drawerToggle = function(a){
    if($content.is(":animated")){return false;}
    switch(a){
      case "help":
        $b.addClass(helpActive).removeClass(optionActive);
        break;
      case "option":
        $b.removeClass(helpActive).addClass(optionActive);
        break;
      case "content":
        $b.removeClass(helpActive).removeClass(optionActive);
        var items = init("set");
        optionDisp(items);
        break;
   }
  };
  $(".open-help").on("click",function(e){
    drawerToggle("help");
    e.stopPropagation();
  });
  $(".open-set").on("click",function(e){
    drawerToggle("option");
    e.stopPropagation();
  });
  $option.on("click",function(e){
    e.stopPropagation();
  });
  $help.on("click",function(e){
    e.stopPropagation();
  });
  $b.on("click",function(){
    if($b.hasClass(helpActive) || $b.hasClass(optionActive)){
      drawerToggle("content");
    }
  });
  
  // Checkボタン押下時
  $("#Go").on("click",function(){
    
    var opt = init("go");
    
    // background.jsにmessageを送信
    chrome.runtime.sendMessage({
      run: "runContentScript",
      options: opt
    });
    // イベントトラッキング
    _gaq.push(['_trackEvent', "Go", 'clicked']);
    // ウィンドウ閉じる
    window.close();
  });
};