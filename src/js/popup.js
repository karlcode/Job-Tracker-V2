// global variables
var autofill = true;
var warning = false;
var jobList = [];

// messaging
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getAutofill") {
    addNewJob(request.autofillData);
  }
});

document.addEventListener('DOMContentLoaded', function() {
    getstoreAndRestoreInDom();

    $("#newJobStatus").attr("class", $("option:selected", this).attr("status"));
    $("#newJobStatus").change(function(){
        var color = $("option:selected", this).attr("status");
        $("#newJobStatus").attr("class", color);
    });
    
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
            if(settings.warning == true) {
                document.getElementById('settingsWarning').checked = true;
            } else {
                document.getElementById('settingsWarning').checked = false;
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
    job.date = formatDate(new Date());
    job.status = document.getElementById('newJobStatus').value;
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
        for(var i = jobs.length - 1; i >= 0; i--) {
            addUrlToDom(jobs[i]);
        }
    });
}

function removeJob(job, node) {
    if (warning && !confirm('Are you sure you want to delete?')) {} else {
        var index = jobList.indexOf(job);
        if (index > -1) {
            jobList.splice(index, 1);
        }
        saveJobs();
        $(node).remove();
    }
}

function formatDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return monthNames[date.getMonth()] + ' ' + date.getDay() + ' ' + date.getFullYear();
}

function addUrlToDom(jobDetails){
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

    var actionBar = document.createElement('div');
    actionBar.setAttribute('class', 'actionBar');
    var trash = document.createElement('i');
    trash.addEventListener('click', function(){removeJob(jobDetails, newLine)});
    trash.setAttribute('class','fa fa-trash-o grey-button');
    actionBar.appendChild(trash);
    console.log(jobDetails.status);
    
    var statusClass = '';
    if (jobDetails.status == 'Interested') {
        statusClass = 'interested';
    } else if (jobDetails.status == 'In Progress'){
        statusClass = 'inProgress';
    } else {
        statusClass = 'completed';
    }

    var uncompressed = document.createElement('div');
    uncompressed.innerHTML = '<div class="header-title">' + jobDetails.company.bold() + "   " + jobDetails.title + '</div>' + '<div class="header-status"><span class="' + statusClass + '">' + jobDetails.status + '</span></div>';
    header.appendChild(uncompressed);
    var compressed = document.createElement('div');
    compressed.setAttribute('class','header-compress');
    compressed.innerHTML = '<i class="fa fa-compress" aria-hidden="true"></i>';
    header.appendChild(compressed);
    header.addEventListener('click', function(event) {
        if(!header.compress) {
            header.compress = 1;
            $(uncompressed).fadeOut(300);
            $(compressed).fadeIn(300);
        } else {
            header.compress = 0;
            $(uncompressed).fadeIn(300);
            $(compressed).fadeOut(300);
        }

    });


    var titleLinkTemp = '<i class="fa fa-link" aria-hidden="true"></i>' + " ";
    if (jobDetails.title == '') {
        titleLinkTemp += 'Link'
    }
    titleLink.innerHTML = titleLinkTemp + jobDetails.title;
    employHead.textContent = "Employer: " + jobDetails.company;
    descLink.textContent =  jobDetails.description;
    timeLink.innerHTML = '<i class="fa fa-calendar" aria-hidden="true"></i> created ' + jobDetails.date.italics();

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
    settings.warning = document.getElementById('settingsWarning').checked;

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

        if (!settings.warning) {
            settings.warning = false;
        }

        if( settings.warning == true) {
            warning = true;
        } else {
            warning = false;
        }
    });
}