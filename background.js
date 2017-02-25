//background.js

//listens for the script to send message
chrome.runtime.onMessage.addListener(
  function(request, sender, callback){
      var xhttp = new XMLHttpRequest();
      var method = request.method;

      //does request
      xhttp.open(method, request.url, true);
      xhttp.send(request.data);
      //when request has returned, send data to callback function
      xhttp.onload = function(){
        console.log(xhttp.responseText)
        callback(JSON.parse(xhttp.responseText));
      }
      return true
  }
);
