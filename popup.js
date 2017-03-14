// global variables
var store=[];

document.addEventListener('DOMContentLoaded', function() {
    getstoreAndRestoreInDom();
    addLink();
    // event listener for the button inside popup window
    document.getElementById('button').addEventListener('click', addLink);
});

// fetch the URL of the current tab, add inside the window
function addLink() {
    chrome.tabs.query({currentWindow: true,active: true}, function(jobDetails) {
        // tabs is an array so fetch the first (and only) object-element in tab
    var tag = '';
  var metaName ='';
  var metaContent = '';
  var metaTags = document.getElementsByTagName('meta');
  for (var i = 0; i < metaTags.length; i++) {
    if (metaTags[i].getAttribute('name')) {
      metaName = metaTags[i].getAttribute('name');
    } else if (metaTags[i].getAttribute('property')) {
      metaName = (metaTags[i].getAttribute('property'));
    } else {
      continue;
    }

    //og meta tags are more likely to be accurate
    metaContent = metaTags[i].getAttribute('content');
    switch (metaName) {
      case 'og:title':
        jobDetails.title = metaContent;
        break;
      case 'title':
        if (!jobDetails.title)
          jobDetails.title = metaContent;
        break;
      case 'og:description':
        jobDetails.description = metaContent;
        break;
      case 'description':
        if (!jobDetails.description)
          jobDetails.description = metaContent;
        break;
      case 'url':
        jobDetails.url = metaContent;
        break;
    }
  }  
        if(store.indexOf(jobDetails) === -1){
            //Don't add duplicates
            addUrlToListAndSave(jobDetails);
            addUrlToDom(jobDetails);
        }
    });
}


function getstoreAndRestoreInDom(){
    chrome.storage.sync.get({store:[]},function(data){
        store = data.store;
        store.forEach(function(jobDetails){
            addUrlToDom(jobDetails);
        });
    });
}

function addUrlToDom(jobDetails){
    // change the text message
    document.getElementById("div").innerHTML = "<h2>Your Jobs</h2>";

    //Inserting HTML text here is a bad idea, as it has potential security holes when
    //  including content not sourced entirely from within your extension (e.g. url).
    //  Inserting HTML text is fine if it is _entirely_ sourced from within your
    //  extension.
    /*
    // format HTML
    var html = '<li><a href=' + url + " target='_blank'>" + url + '</a></li>';
    //Add URL to DOM
    document.getElementById("list").insertAdjacentHTML('beforeend',html);
    */
    //Build the new DOM elements programatically instead:
    var newLine = document.createElement('li');
    var newLink = document.createElement('a');
    newLink.textContent = jobDetails[0].title;
    
    console.log(jobDetails[0].title)
    newLink.setAttribute('href',jobDetails[0].url);
    newLink.setAttribute('target','_blank');
    newLine.appendChild(newLink);
    document.getElementById("list").appendChild(newLine);
}

function addUrlToListAndSave(jobDetails){
    if(store.indexOf(jobDetails) === -1){
        //URL is not already in list
        store.push(jobDetails);
        savestore();
    }
}

function savestore(callback){
    chrome.storage.sync.set({store},function(){
        if(typeof callback === 'function'){
            //If there was no callback provided, don't try to call it.
            callback();
        }
    });
}