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
    getstoreAndRestoreInDom();
    
    var newJobForm = document.getElementById('newJob');
    var settingsForm = document.getElementById('settings');
    var addJobButton = document.getElementById('addJob');
    var settingsButton = document.getElementById('changeSettings');

    // addJob form
    addJobButton.addEventListener('click', function() {
        getAutofill();
        settingsForm.style.display = 'none';
        newJobForm.style.display = 'block';
    });
    document.getElementById('saveNewJob').addEventListener('click', saveNewJob);
    document.getElementById('trashNewJob').addEventListener('click', function() {
        newJobForm.style.display = 'none';
    });

    // settings form
    settingsButton.addEventListener('click', function() {
        getSettings(function(settings){
            if(settings.autofill != null && settings.autofill == false) {
                document.getElementById('settingsAutofill').checked = false;
            } else {
                document.getElementById('settingsAutofill').checked = true;
            }
        });
        newJobForm.style.display = 'none';
        settingsForm.style.display = 'block';
    });
    document.getElementById('saveSettings').addEventListener('click', function(){
        saveSettings(function(){
            settingsForm.style.display = 'none';
            // load setting after each save
            loadSettings();
        });
    });
    document.getElementById('trashSettings').addEventListener('click', function() {
        settingsForm.style.display = 'none';
    });

    loadSettings();
});


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
    var dt = new Date();
    var utcDate = dt.toUTCString();
    var p = document.createElement("p");

    var newLine = document.createElement('li');
    var header = document.createElement('div');
    var body = document.createElement('div');
    var descLink = document.createElement('span');
    var timeLink = document.createElement('span');
    var titleHead = document.createElement('h4');
    var employHead = document.createElement('h5');
    var titleLink = document.createElement('a');
    var time = "Job application logged at " + utcDate;
    
    //var button = document.createElement('button');
    //button.addEventListener('click', function(){console.log("hello")});

    //header.setAttribute('href',jobDetails.url);
    //header.setAttribute('target','_blank');
    header.innerHTML = jobDetails.title.bold() + "   " + jobDetails.company;
    titleLink.textContent = jobDetails.title;
    employHead.textContent = "Employer: " + jobDetails.company;
    descLink.textContent =  jobDetails.description;
    timeLink.innerHTML = time.italics();

    header.setAttribute('class','collapsible-header');
    body.setAttribute('class','collapsible-body');
    titleLink.setAttribute('href',jobDetails.url);
    titleLink.setAttribute('target','_blank');
    
    newLine.appendChild(header);
    newLine.appendChild(body);
        body.appendChild(titleHead);
            titleHead.appendChild(titleLink);
        body.appendChild(employHead);
        body.appendChild(descLink);
        body.appendChild(p);
        body.appendChild(timeLink);
    
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

function getSettings(callback) {
    chrome.storage.local.get('settings', function(data){
        if (chrome.runtime.lastError) {
            console.log("Error: unable to load jobs from storage")
        } else {
            if (!data.settings) 
                data.settings = {};
                
            if(typeof callback === 'function') {
                callback(data.settings);
            }    
        }
    });
    
}

function saveSettings(callback) {
    var settings = {};

    settings.autofill = document.getElementById('settingsAutofill').checked;

    chrome.storage.local.set({'settings' : settings}, function(){
        if (chrome.runtime.lastError) 
            console.log("Error: unable to save job to storage")

        if(typeof callback === 'function') {
            callback();
        }    
    });
}

function loadSettings() {
    getSettings(function(settings){
        if(settings.autofill != null && settings.autofill == false) {
            autofill = false;
        } else {
            autofill = true;
        }
    });
}