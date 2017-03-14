// global variables
var store=[];
var autofill = true;

// messaging
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getAutofill") {
    addNewJob(request.autofillData);
  }
});

document.addEventListener('DOMContentLoaded', function() {
    //getstoreAndRestoreInDom();
    getstoreAndRestoreInDom();
    
    var addJobButton = document.getElementById('addJob')
    addJobButton.addEventListener('click', getAutofill);
    addJobButton.addEventListener('click', function() {
        document.getElementById('newJob').style.display = 'block';
    });

    document.getElementById('saveNewJob').addEventListener('click', saveNewJob);
});   

function getAutofill() {
    if (autofill) {
        chrome.tabs.executeScript(null, {
            file: "js/autofill.min.js"
        }, function() {
            if (chrome.runtime.lastError) {
                console.log("error: cannot execute autofill.js")
            }
        });
    } else {
        addNewJob();
    }
}

function addNewJob(autofillData) {
    var newJob = {};

    if (autofill) {
        newJob = autofillData;
    } else {
        newJob = {
            company: '',
            description: '',
            title: '',
            url: ''
        };
    }

    setNewJobForm(newJob);
    /** 
     * ---
     * --- DELETE IF NO LONGER NEEDED
     * ---
    chrome.tabs.query({currentWindow: true,active: true}, function(jobDetails) {
        if(store.indexOf(jobDetails) === -1){
            //Don't add duplicates
            addUrlToListAndSave(jobDetails);
            addUrlToDom(jobDetails);
        }
    }); */
}

function saveNewJob() {
    saveJob(getNewJobForm(), function() {
        getstoreAndRestoreInDom();
        document.getElementById('newJob').style.display = 'none';
    });
}

function saveJob(job, callback){
    chrome.storage.local.get('jobs', function(data){
        if (chrome.runtime.lastError) {
            console.log("Error: unable to load jobs from storage")
        } else {
            if (!data.jobs) 
                data.jobs = [];

            data.jobs.push(job);
            chrome.storage.local.set({'jobs' : data.jobs}, function(){
                if (chrome.runtime.lastError) 
                    console.log("Error: unable to save job to storage")
                callback();
            });
        }
    });
}

function getJobs(callback) {
    chrome.storage.local.get('jobs', function(data){
        if (chrome.runtime.lastError) {
            console.log("Error: unable to load jobs from storage")
        } else {
            if (!data.jobs)
                data.jobs = [];
            callback(data.jobs);
        }
    });
}

function getNewJobForm() {
    var job = {};
    job.company = document.getElementById('newJobCompany').value
    job.title = document.getElementById('newJobTitle').value;
    job.url = document.getElementById('newJobURL').value;
    job.description = document.getElementById('newJobDescription').value;
    return job;
}

function setNewJobForm(job) {
    document.getElementById('newJobCompany').value = job.company;
    document.getElementById('newJobTitle').value = job.title;
    document.getElementById('newJobURL').value = job.url;
    document.getElementById('newJobDescription').value = job.description;
}


function getstoreAndRestoreInDom(){
    document.getElementById("list").innerHTML = '';

    getJobs(function(jobs) {
        jobs.forEach(function(job) {
            addUrlToDom(job);
        })
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
    newLink.textContent = jobDetails.title;
    
    console.log(jobDetails.title)
    newLink.setAttribute('href',jobDetails.url);
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
            callback();
        }
    });
}