// script.js
var videoUrl = document.location.href;
var videoId = videoUrl.split("v=")[1];

console.log(videoId);

//send message to background to run http request to avoid cross domain policy
//callback function returns comments
chrome.runtime.sendMessage({
  method: 'GET',
  url:'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=' + videoId + '&key=AIzaSyDvt7MmIIHpp3p_HP-pvU26bsZlaQhfR5s&maxResults=100',
  data: ''
}, function(response){
    var n = response.items.length;
    for(var i = 0; i < n; i++){
      const regex = /[0-9]{1,2}:[0-9]{1,2}[A-Z ].*/g;
      var str = response.items[i].snippet.topLevelComment.snippet.textOriginal;

      let m;
      var count = 0;
      while ((m = regex.exec(str)) !== null) {

        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        count++;
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);
        });

      }


      //console.log(wholeText.match(regex));
    }
});

//response.items[0].snippet.topLevelComment.snippet.textOriginal
