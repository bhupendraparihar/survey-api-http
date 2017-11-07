var pollOrganizer = (function() {
    
        var serverAddress= 'https://10.198.2.72:8080',
            postNewPollToServer = function(postData) {
                console.info('Creating new poll request to the server');
                return $.ajax({
                    type: 'POST',
                    url: serverAddress + '/survey/create',
                    data: postData
                });
            },
            getallPollsFromServer = function(meetingId) {
                console.info('Get all the surveys for a meetig by meetingID from the server');
                return $.ajax({
                    type: 'GET',
                    url: serverAddress + '/api/survey/meeting/' + meetingId
                });
            },
            getPollDetailsByIdFromServer = function(pollId) {
                console.info('Get poll details by pollId from server');
                return $.ajax({
                    type: 'GET',
                    url: serverAddress + '/api/survey/' + pollId
                });
            },
            getLatestPoll = function(meeting_id) {
                console.log("Getting Latest poll");
                return $.ajax({
                    type: 'GET',
                    url: serverAddress + '/api/survey/latest/meeting/' + meeting_id
                });
            },
            sendPollEndToServer = function (pollId) {
                console.log('Set poll end in the server' + pollId);
                return $.ajax({
                    type: 'POST',
                    url: serverAddress + '/api/survey/end/' + pollId
                });
            },
            publishPollGetResult = function(pollId){
                console.log('publish poll in the server' + pollId);
                return $.ajax({
                    type: 'POST',
                    url: serverAddress + '/api/survey/publish/' + pollId
                });
            },
        surveryList = [],
        pollData,
        pollContext;
    
    
        return {
            init: function(config) {
                this.cacheElements();
                this.bindEvents();
                // this.displaySectionById('');
                this.setConfiguation(config);
                pollContext = this;
                if (config.isPresenter) {
                    this.showPollList();
                    this.displaySectionById('pollListSection');
                } else {
                    this.displaySectionById('pollViewer');
                    $('#pollViewer').hide();
                    //this.getLivePoll();
                    pollContext.getPollTimer = setInterval(pollContext.getLivePoll, 5000);
                }
            },
            cacheElements: function() {
                this.pollListApp = document.getElementById('poll-list-app');
                this.pollListElement = document.getElementById('pollListEntries');
                this.createPollSection = document.getElementById('createPollSection');
                this.createPollsBtn = $('.create-new-btn');
                this.pollListSection = document.getElementById('pollListSection');
                this.showPollSection = document.getElementById('showPollSection');
                this.pollViewer = document.getElementById('pollViewer');
                this.pollViewerSection = document.getElementById('pollViewerSection');
                this.pollQuestion = document.getElementById('pollQuestion');
                this.lblOption1 = document.getElementById('lblOption1');
                this.lblOption2 = document.getElementById('lblOption2');
                this.pollOption1 = document.getElementById('pollOption1');
                this.pollOption2 = document.getElementById('pollOption2');
                this.btnSubmit = document.getElementById('btnSubmit');
                this.endPollButton = document.getElementById('endPollButton');
                this.pollResult = document.getElementById('pollResult');
            },
            bindEvents: function() {
                var that = this;
                this.btnSubmit.addEventListener("click", this.submitPoll);
            },
            setConfiguation: function(config) {
                this.config = config;
                if (this.config.isPresenter) {
                    this.pollListApp.classList.add('presenter');
                } else {
                    this.pollListApp.classList.add('organizer');
                }
            },
            displaySectionById: function(id) {
                this.createPollSection.style.display = 'none';
                this.pollListSection.style.display = 'none';
                this.showPollSection.style.display = 'none';
                this.pollViewer.style.display = 'none';
                switch (id) {
                    case 'createPollSection':
                        {
                            this.createPollSection.style.display = 'block';
                            $('#pollStatement').val('');
                            $('.poll-options input').val('');
                            break;
                        }
                    case 'pollListSection':
                        {
                            if (this.config.isPresenter) {
                                this.pollListSection.style.display = 'block';
                            }
                            break;
                        }
                    case 'showPollSection':
                        {
                            this.showPollSection.style.display = 'block';
                            this.pollResult.style.display = 'none';
                            break;
                        }
                    case 'pollViewer':
                        {
                            this.pollViewer.style.display = 'block';
                            break;
                        }
                    default:
                        break;
                }
            },
            showPollList: function(pollListData) {
                var that = pollContext;
                that.displaySectionById('pollListSection');

                // TODO: that.showPollListEntries(pollListData);
                that.showPollListEntries(pollListData);
            },
            cancelNewPoll: function() {
                pollContext.displaySectionById('pollListSection');
            },
            showPollListEntries: function(pollListData) {
                var that = this;
                var i = 0;
                $(that.pollListElement).html('');
             
                    var getPolls = this.getallPollsFromServer(pollContext.config.meeting_id);
    
                    // this.pollListElement.innerHTML = '';
                    getPolls.then(function(pollList) {
                        console.log(pollList);
                        console.info('Successfully received all the polls for the meeting');
                        var i = 0;
                        pollList.forEach(function(poll) {
                            var row = $('<tr><td data-id="' + poll.survey_id + '">' + poll.question + '</td></tr>');
                            row.click(function () {
                                that.showPollDetailsByPollId(poll.survey_id, {end: poll.end, published: poll.published});
                            });
                            
                            $(that.pollListElement).append(row);
                        });
                    }, function(err) {
                        console.error('Could not get all the surveys for the meeting');
                    });
                // }
    
            },
            createNewPoll: function() {
                pollContext.displaySectionById('createPollSection');
            },
            submitNewPoll: function() {
                var that = pollContext;
                var data = {
                        question: '',
                        answers: [],
                        meeting_id: that.config.meeting_id,
                        presenter_id: that.config.presenter_id
                    },
                    newPoll, pollStatement,
                    pollOptions = [],
                    pollOptionsArr = [];
    
                pollStatement = $('#createPollSection .poll-statement textarea')[0].value;
                pollOptionsArr = $('#createPollSection .poll-options input');
                for (var i = 0; i < pollOptionsArr.length; i++) {
                    pollOptions.push(pollOptionsArr[i].value);
                }
                if (pollStatement && pollOptions) {
                    data.question = pollStatement;
                    data.answers = pollOptions;
                    newPoll = that.postNewPollToServer(data);
                    newPoll.then(function(data) {
                        console.log(data);
                        console.info('Successfully created new poll');
                        that.showPollList(data);
                    }, function(err) {
                        console.error('Could not create new poll');
                    });
                } else {
                    console.error('Provide options and poll statement');
                }
            },
            showPollDetailsByPollId: function(pollId, options) {
                var that = pollContext,
                    getPoll = this.getPollDetailsByIdFromServer(pollId);
    
                //Clean up pre-rendered data
                $('#showPollSection .poll-statement').html('');
                $('#showPollSection .poll-options li').val('');
    
                getPoll.then(function(pollItem) {
                    var poll = pollItem[0];
                    console.log(poll);
                    console.info('Successfully received poll details from the server');
                    that.displaySectionById('showPollSection');
                    $('#showPollSection .poll-statement').html(poll.question);
                    
                    //Setting pollId so to retrive while sending endPoll call
                    $('#showPollSection .poll-statement').attr('data-id', pollId);

                    let pollOptionsArr = $('#showPollSection .poll-options li');
                    for (var i = 0; i < pollOptionsArr.length; i++) {
                        pollOptionsArr[i].innerHTML = poll.answers[i].text;
                    }
                    // if (options.end && options.published) {
                    //     that.endPollButton.style.display = 'none';
                    // } else {
                        if(options.end){
                            that.endPollButton.innerHTML = 'See Result';
                        }else{
                            that.endPollButton.innerHTML = 'End Poll';
                        }
                        that.endPollButton.style.display = 'inline-block';
                    // }
                }, function(err) {
                    console.error('Failed to get the poll details from server');
                });
            },
            endPoll: function () {
                var pollId = $('#showPollSection .poll-statement').attr('data-id');
                if ($('#endPollButton').html() == 'End Poll'){
                    var pollEnd = sendPollEndToServer(pollId);
                    pollEnd.then(function(message){
                        console.log(message);
                        $('#endPollButton').html('See Result');
                    },function(err){
                        console.log(err);
                    });
                } else {
                    /**
                    * This will publish the poll and get results
                    */
                    var pollEnd = publishPollGetResult(pollId);
                    pollEnd.then(function(message){
                        console.log(message);
                        var result = '';
                        pollContext.pollResult.style.display = 'block';
                        pollContext.pollResult.innerHTML = '';
                        if (!message.length) {
                            pollContext.pollResult.innerHTML = '<div class="poll-result-failure">No results available for this poll</div>';
                        } else {
                            pollContext.pollResult.innerHTML += '<div class="poll-result-success-header">Poll Results</div>';
                            message.forEach(function(m){
                                pollContext.pollResult.innerHTML += '<div><span class="text"> ' + m.text + '</span><span class="count"> : ' + m.count + '</span></div>';
                            });
                        }
                    },function(err){
                        console.log(err);
                        alert("Error while getting poll results");
                    });
                }
            },
            getLivePoll : function() {
                var meetingId = "12345R";
                var self = this;
                
                pollContext.optionsLables = $('.poll-viewer .option-text') ;
                //Call service method get poll
                var livePoll =  $.ajax ({
                    type: 'GET',
                    url: serverAddress + '/api/survey/latest/meeting/' + meetingId
                });
     
                livePoll.then (function (poll) {
                    var localPollData = localStorage.getItem(poll.survey_id);
                    //Content alreay displayed or alredy answered
                    if (pollContext.pollData  || localPollData)
                        {
                        //pollContext.getPollTimer = setInterval(pollContext.getLivePoll, 5000);
                        return;
                    }
                    
                    //Data to display
                    if (poll) {
                       pollContext.pollData = poll;
                       clearInterval(pollContext.getPollTimer);
                       $('#pollViewer').show();
                       pollContext.pollQuestion.innerText  = poll.question;
                       poll.answers.forEach(function (answer, index) {
                           pollContext.optionsLables[index].innerText = answer.text;
                           pollContext.optionsLables[index].value = answer.id;                
                       });
                       $('input[name=pollOption].poll-option1').prop('checked',true)
                    }
                    
                   
                },function(err){
                    console.error("Error while getting latest survey");
                });
            },
            submitPoll : function() {
                var data = {};
                var answer, self= this;

                if (pollOption1.checked) {
                    answer = lblOption1.value;
                } else if (pollOption2.checked) {
                    answer = lblOption2.value;
                }else{
                    return;
                }

                data.answer_id = answer;                
                data.survey_id = pollContext.pollData.survey_id;
                var pollSubmit =  $.ajax ({
                    type: 'POST',
                    url: serverAddress + '/api/survey/answer',
                    data: data
                });
     
                pollSubmit.then (function (message) {
                   // $('input[name=pollOption]').attr('checked',false);
                    
                    $('#pollViewer').hide();
                    alert(message.message);              
                    console.info('Successfully submitted poll');

                    //Call Service method to submit the poll
                    localStorage.setItem(pollContext.pollData.survey_id, pollContext.pollData.survey_id);
                    pollContext.pollData = "";

                    //Restart the ajax call
                    pollContext.getPollTimer = setInterval(pollContext.getLivePoll, 5000);          
                }, function (err) {
                    console.error('Could not submit poll');
                });
     
                
            },
            postNewPollToServer: postNewPollToServer,
            getallPollsFromServer: getallPollsFromServer,
            getPollDetailsByIdFromServer: getPollDetailsByIdFromServer,
            surveryList: surveryList
        }
    })();
    
    /**
     * This object has to come from webinar application
     */
    // var config = {
    //     isPresenter: true,
    //     presenter_id: "123456",
    //     meeting_id: "12345R",
    // }
    
    //pollOrganizer.init(config);