// script.js
var videoUrl = document.location.href;
var videoId = videoUrl.split("v=")[1];

console.log(videoId);

//send message to background to run http request to avoid cross domain policy
//callback function returns comments
chrome.runtime.sendMessage({
  method: 'GET',
  url:'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=' + videoId + '&key=AIzaSyDvt7MmIIHpp3p_HP-pvU26bsZlaQhfR5s',
  data: ''
}, function(response){
  console.log(response);
});
