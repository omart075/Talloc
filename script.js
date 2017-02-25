// script.js



var vidWidthPx = 0;

var videoUrl = document.location.href;
var videoId = videoUrl.split("v=")[1];

//console.log(videoId);

//send message to background to run http request to avoid cross domain policy
//callback function returns comments
chrome.runtime.sendMessage({
  method: 'GET',
  url:'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=' + videoId + '&key=AIzaSyDvt7MmIIHpp3p_HP-pvU26bsZlaQhfR5s&maxResults=100',
  data: ''
}, function(response){
    var n = response.items.length;
    var temp = [];
    var tracklist = [];


    for(var i = 0; i < n; i++){
      const regex = /[0-9]{1,2}:[0-9]{1,2}[A-Z ].*/g;
      var str = response.items[i].snippet.topLevelComment.snippet.textOriginal;

      let m;
      if(temp.length >= 2)
      {
        if(temp.length > tracklist.length){
          tracklist = temp;
        }
        temp = [];
      }
      else{
        temp = [];
      }
      while ((m = regex.exec(str)) !== null) {

        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
        temp.push(match);
        });

      }

    }
    //console.log(tracklist);
    function generateTimeStamps(){
    console.log(tracklist[6])
    for(var i = 0; i < tracklist.length; i++){
    vidWidthPx = document.getElementsByClassName("ytp-progress-bar-padding")[0].offsetWidth;

    var timeStampPre = Number(tracklist[i].split(":")[0]);

    var timeStampPost = Number(tracklist[i].split(":")[1].split(" ")[0]);

    var timeStampInSec = timeStampPre * 60 + Number(timeStampPost);

    var vidLength = document.getElementsByClassName("ytp-time-duration")[0].innerHTML;

    var vidLengthInSec = vidLength.split(":")[0] * 3600 + vidLength.split(":")[1] * 60 + Number(vidLength.split(":")[2]);

    console.log(vidLengthInSec + " " + vidWidthPx);
    var secPerPx = vidLengthInSec / vidWidthPx;
    console.log(timeStampInSec + " " + secPerPx);
    var timeStampPos = (timeStampInSec / secPerPx) - 1.5;
    console.log(timeStampPos)
    //console.log(document.getElementsByClassName("ytp-progress-bar-padding")[0].offsetWidth);
    var a = document.createElement("div");
    a.setAttribute("id", "square" + i);
    a.setAttribute("style", "width:5px; height:2.5px; background:orange; float: left; transform: translateX(" + timeStampPos + "px);");
    document.getElementsByClassName("ytp-progress-bar")[0].appendChild(a);


}
}

function removeTimeStamps()
{
  for (var i=0; i < tracklist.length; i++)
  {
    try{
    var element = document.getElementById("square" + i);
    element.parentNode.removeChild(element);
  } catch(err){break;}
  }
}
var timeout = null;
document.addEventListener("DOMSubtreeModified",
function()
{
	if(timeout)clearTimeout(timeout);
	timeout = setTimeout(listener, 1500);
}, false);


function listener()
{
}

generateTimeStamps();



});

//response.items[0].snippet.topLevelComment.snippet.textOriginal
