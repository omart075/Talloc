// script.js

var vidWidthPx = 0;

var videoUrl = document.location.href;
var videoId = videoUrl.split("v=")[1];


//send message to background to run http request to avoid cross domain policy
//callback function returns video description
chrome.runtime.sendMessage({
  method: 'GET',
  url:'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&fields=items/snippet/description&key=AIzaSyDvt7MmIIHpp3p_HP-pvU26bsZlaQhfR5s&maxResults=50',
  data: ''
}, function(response){
    //gets video description
    var descr = response.items[0].snippet.description;

    //regex matching to get tracklist from description
    const regex1 = /[A-Z].*[0-9]{1,2}:[0-9]{1,2}/g;
    var tracklistArr = descr.match(regex1);
    console.log(tracklistArr)
    var tracklistStr;
    var tracklist;
    var positions = [];

    //first regex returns array so array is made into string for next regex
    for(var i = 0; i < tracklistArr.length; i++){
      //In case some numbers before the tracklist interfere
      if(!tracklistArr[0].includes("00:00"))
      {
        tracklistArr[0] = "";
      }
      tracklistStr += tracklistArr[i] + "\n"
    }

    //regex to get times from tracklist
    const regex2 = /[0-9]{1,2}:[0-9]{1,2}/g;
    tracklist = tracklistStr.match(regex2);


    //renders time stamps onto video
    function generateTimeStamps(){

      //for every song in the tracklist
      for(var i = 0; i < tracklist.length; i++){

        //values to calculate position of time stamp
        vidWidthPx = document.getElementsByClassName("ytp-progress-bar-padding")[0].offsetWidth;

        var timeStampPre = Number(tracklist[i].split(":")[0]);

        var timeStampPost = Number(tracklist[i].split(":")[1]);

        var timeStampInSec = (timeStampPre * 60) + timeStampPost;

        var vidLength = document.getElementsByClassName("ytp-time-duration")[0].innerHTML;

        var vidLengthInSec = (Number(vidLength.split(":")[0]) * 60) + Number(vidLength.split(":")[1]);


        var secPerPx = vidLengthInSec / vidWidthPx;

        //position of time stamp
        var timeStampPos = (timeStampInSec / secPerPx);
        positions.push(timeStampPos);

        //make the element css
        var a = document.createElement("div");
        a.setAttribute("id", "square" + i);
        a.setAttribute("style", "width:5px; height:2.5px; background:white; margin-bottom: 2px; display: inline-block; transform: translateX(" + timeStampPos + "px);");

        //append to video
        document.getElementsByClassName("ytp-progress-bar-padding")[0].appendChild(a);

        //when you hover over the time stamp, it displays the song title
        //when you  hover off, it removes the song title
        element = document.getElementById("square" + i);
        element.onmouseover = function(){songInfo(this)};
        element.onmouseout = function(){removeTitle(this)};

      }
    }

    //listener for any changes (video size) on the screen
    var timeout = null;
    document.addEventListener("DOMSubtreeModified",
    function(){
    	if(timeout)clearTimeout(timeout);
    	timeout = setTimeout(listener, 1500);
    }, false);


    function listener()
    {
    }

    //function call to generate the time stamps
    generateTimeStamps();

    //function to get title of element being hovered over
    function songInfo(index){

      const regex3 = /[a-zA-Z' *!&._-]+/g;
      var tracklistStr;
      var trackNames = [];

      for(var i = 0; i < tracklistArr.length; i++){
        if(tracklistArr[i] != ""){
          tracklistStr += tracklistArr[i] + "\n";
        }
      }

      tracklist = tracklistStr.match(regex3);
      //console.log(tracklist)


      var trackIndex = index.id.split("e")[1];
      var trackName = tracklist[trackIndex];

      //regex matching to get song title
      const regex = /[A-Z].*/g;
      trackName = trackName.match(regex)[0]

      //creating the css for the element and appending it to the video controls bar
      var a = document.createElement("p");
      a.setAttribute("id", "title" + trackIndex)
      a.setAttribute("style", "color: white; display: inline; float:right");
      a.innerHTML = trackName;
      document.getElementsByClassName("ytp-left-controls")[0].appendChild(a);
    }

    //function to remove title after you hover off time stamp
    function removeTitle(index){
      var trackIndex = index.id.split("e")[1];
      var element = document.getElementById("title" + trackIndex);
      element.parentNode.removeChild(element);
    }
});


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
    var positions = [];
    var left = 0;
    var right = 1;

    //for every comment the video has
    for(var i = 0; i < n; i++){
      //regex we will be matching with
      const regex = /[0-9]{1,2}:[0-9]{1,2}[A-Z ].*/g;

      //Actual text from comment
      var str = response.items[i].snippet.topLevelComment.snippet.textOriginal;

      //if comment has 2 or more time stamps, we update tracklist to the biggest
      //tracklist found in the comments and resets temp
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
      //regex matching process
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

    //renders time stamps onto video
    function generateTimeStamps(){
      console.log(tracklist)

      //for every song in the tracklist
      for(var i = 0; i < tracklist.length; i++){

        //values to calculate position of time stamp
        vidWidthPx = document.getElementsByClassName("ytp-progress-bar-padding")[0].offsetWidth;

        var timeStampPre = Number(tracklist[i].split(":")[0]);

        var timeStampPost = Number(tracklist[i].split(":")[1].split(" ")[0]);

        var timeStampInSec = timeStampPre * 60 + Number(timeStampPost);

        var vidLength = document.getElementsByClassName("ytp-time-duration")[0].innerHTML;

        var vidLengthInSec = vidLength.split(":")[0] * 60 + Number(vidLength.split(":")[1]);


        var secPerPx = vidLengthInSec / vidWidthPx;

        //position of time stamp
        var timeStampPos = (timeStampInSec / secPerPx - 5);
        positions.push(timeStampPos);

        //make the element css
        var a = document.createElement("div");
        a.setAttribute("id", "square" + i);
        a.setAttribute("style", "width:5px; height:2.5px; background:white; margin-bottom: 2px; display: inline-block; transform: translateX(" + timeStampPos + "px);");

        //append to video
        document.getElementsByClassName("ytp-progress-bar-padding")[0].appendChild(a);

        //when you hover over the time stamp, it displays the song title
        //when you  hover off, it removes the song title
        element = document.getElementById("square" + i);
        element.onmouseover = function(){songInfo(this)};
        element.onmouseout = function(){removeTitle(this)};

      }
      console.log(positions)
      var currTime = document.getElementById("movie_player");
      console.log(currTime)
      //detects the change in position of the progress bar
      // var element = document.getElementsByClassName("ytp-scrubber-container")[0];
      // var observer = new WebKitMutationObserver(function (mutations) {
      //   mutations.forEach(attrModified);
      // });
      //
      // observer.observe(element, { attributes: true });
      //
      // function attrModified(mutation) {
      //   var name = mutation.attributeName,
      //   newValue = mutation.target.getAttribute(name),
      //   oldValue = mutation.oldValue;
      //
      //   console.log(name, newValue, oldValue);
      //   displayTitle(positions, newValue);
      // }
    }

    //listener for any changes (video size) on the screen
    var timeout = null;
    document.addEventListener("DOMSubtreeModified",
    function(){
    	if(timeout)clearTimeout(timeout);
    	timeout = setTimeout(listener, 1500);
    }, false);


    function listener()
    {
    }

    //function call to generate the time stamps
    generateTimeStamps();

    //function to get title of element being hovered over
    function songInfo(index){

      var trackIndex = index.id.split("e")[1];
      var trackName = tracklist[trackIndex];

      //regex matching to get song title
      const regex = /[A-Z].*/g;
      trackName = trackName.match(regex)[0]

      //creating the css for the element and appending it to the video controls bar
      var a = document.createElement("p");
      a.setAttribute("id", "title" + trackIndex)
      a.setAttribute("style", "color: white; display: inline; float:right");
      a.innerHTML = trackName;
      document.getElementsByClassName("ytp-left-controls")[0].appendChild(a);
    }

    //function to remove title after you hover off time stamp
    function removeTitle(index){
      var trackIndex = index.id.split("e")[1];
      var element = document.getElementById("title" + trackIndex);
      element.parentNode.removeChild(element);
    }

    // function displayTitle(positions, newValue){
    //   console.log(positions)
    //   console.log(newValue)
    // }

});
