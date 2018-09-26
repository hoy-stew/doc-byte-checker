chrome.runtime.onMessage.addListener(
  // popup.jsからのメッセージ受信
  function( message, sender, sendResponse ) {
    if (message.run === "runContentScript"){
      // content_script.jsに起動メッセージ送信
      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {options: message.options,greeting:"first"}, function(response) {
          // content_script.jsからURL配列を受信したら、容量を取得して返す
          var urlArray = response.result,
              sizeArray = [];
          
          // ループ処理の完了を受け取るPromise
          new Promise(function(res, rej) {
            // ループ処理（再帰的に呼び出し）
            function loop(i) {
              // 非同期処理なのでPromiseを利用
              return new Promise(function(resolve, reject) {
                // 非同期処理部分
                var req = new XMLHttpRequest();
                req.open("HEAD",urlArray[i]);
                req.send();
                req.onreadystatechange = function(){
                  if(req.readyState !== 4){

                  } else if(req.status !== 200) {
                    sizeArray.push("Error" + req.status);
                    resolve(i+1);
                  } else {
                    var size = req.getResponseHeader("Content-Length");
                    sizeArray.push(size);
                    resolve(i+1);
                  }
                };
              })
              .then(function(count) {
                // ループを抜けるかどうかの判定
                if (count >= urlArray.length) {
                  // 抜ける（外側のPromiseのresolve判定を実行）
                  res();
                } else {
                  // 再帰的に実行
                  loop(count);
                }
              });
            }
            // 初回実行
            loop(0);
          }).then(function() {
            // ループ処理が終わったらここにくる
            // content_script.jsに容量を送信
            chrome.tabs.sendMessage(tab.id, {options: message.options,greeting:"second",size: sizeArray});
          });
        });
      });
      return true;
    }
  }
);