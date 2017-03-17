// global variables
var autofill = true;
var jobList = [];

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
}

function saveNewJob() {
    jobList.push(getNewJobForm());
    saveJobs(function() {
        getstoreAndRestoreInDom();
        document.getElementById('newJob').style.display = 'none';
    });
}

function saveJobs(callback){
    chrome.storage.local.set({'jobs' : jobList}, function(){
        if (chrome.runtime.lastError) 
            console.log("Error: unable to save job to storage")
        if(typeof callback === 'function') {
            callback();
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
            jobList = data.jobs;
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

function removeJob(job, node) {
    var index = jobList.indexOf(job);
    if (index > -1) {
        jobList.splice(index, 1);
    }
    saveJobs();
    $(node).remove();
}

function addUrlToDom(jobDetails){
    var dt = new Date();
    var utcDate = dt.toUTCString()
    var p = document.createElement("p");

    var newLine = document.createElement('li');
    newLine.jobDetails = jobDetails;
    var header = document.createElement('div');
    var body = document.createElement('div');
    var descLink = document.createElement('span');
    var timeLink = document.createElement('span');
    var titleHead = document.createElement('h4');
    var employHead = document.createElement('h5');
    var titleLink = document.createElement('a');
    var time = "Job application logged at " + utcDate;

    var actionBar = document.createElement('div');
    actionBar.setAttribute('class', 'actionBar');
    var trash = document.createElement('i');
    trash.addEventListener('click', function(){removeJob(jobDetails, newLine)});
    trash.setAttribute('class','fa fa-trash-o dark-button');
    actionBar.appendChild(trash);
    var time = "Job application logged at " + jobDetails.utcDate;
    


    header.innerHTML = jobDetails.title.bold() + "   " + jobDetails.company;

    //header.setAttribute('href',jobDetails.url);
    //header.setAttribute('target','_blank');
    header.innerHTML = jobDetails.company.bold()+ "   " + jobDetails.title  ;

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
    body.appendChild(actionBar);
    
    document.getElementById("list").appendChild(newLine);
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