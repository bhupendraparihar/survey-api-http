const fs = require('fs');
let surveyList = JSON.parse(fs.readFileSync("./db/surveys.json"));

function createSurvey(configObj) {

    let timeStamp = Date.now();

    function createAnswersObject(answersArray) {
        var answers = [];
        answersArray.forEach(function(answer, index) {
            answers.push({
                id: index,
                text: answer
            });
        });

        return answers;
    }

    if (configObj.meeting_id === "" || !configObj.meeting_id) {
        throw { "Error": "No meeting id provided" };
    }

    var newSurveyObject = {
        survey_id: configObj.meeting_id + 'T' + timeStamp,
        question: configObj.question,
        answers: createAnswersObject(configObj.answers),
        meeting_id: configObj.meeting_id,
        presenter_id: configObj.presenter_id,
        timeStamp: timeStamp,
        published: false,
        end: false
    }

    let surveysList = getSurveyList();
    surveysList.push(newSurveyObject);
    fs.writeFileSync("./db/surveys.json", JSON.stringify(surveysList), 'utf8');
    console.log(getSurveysByMeetingId(configObj.meeting_id));
    return getSurveysByMeetingId(configObj.meeting_id);
}

function getSurveyById(survey_id) {
    let data = fs.readFileSync("./db/surveys.json");
    let surveyList = JSON.parse(data);
    return surveyList.filter(function(survey) {
        return survey.survey_id == survey_id;
    });
}

function getSurveyList() {
    let data = fs.readFileSync("./db/surveys.json");
    let surveyList = JSON.parse(data);
    return surveyList;
}

function getSurveysByMeetingId(meeting_id) {
    let data = fs.readFileSync("./db/surveys.json");
    let surveyList = JSON.parse(data);
    return surveyList.filter(function(survey) {
        return survey.meeting_id == meeting_id;
    });
}

function getSurveysByPresenterId(presenter_id) {
    let data = fs.readFileSync("./db/surveys.json");
    let surveyList = JSON.parse(data);
    return surveyList.filter(function(survey) {
        return survey.presenter_id == presenter_id;
    });
}

function getLatestSurveyByMeetingId(meeting_id) {

    let latestSurvey;
    let data = fs.readFileSync("./db/surveys.json");
    let surveyList = JSON.parse(data);
    let surveys = surveyList.filter(function(survey) {
        return survey.meeting_id == meeting_id && !survey.published && !survey.end;
    });

    if (surveys.length) {
        latestSurvey = surveys.reduce(function(prev, current) {
            return (prev.timeStamp > current.timeStamp) ? prev : current
        });
        return latestSurvey;
    }

    return null;

}

function getSubmittedAnswer() {
    let data = fs.readFileSync("./db/answers.json");
    let submittedAnswers = JSON.parse(data);
    return submittedAnswers;
}

function surveryAnswerSubmit(ansObj) {
    let data = fs.readFileSync("./db/surveys.json");
    let surveyList = JSON.parse(data);
    surveyList = surveyList.filter(function(survey) {
        return survey.survey_id == ansObj.survey_id && !survey.end;
    });
    if (surveyList.length) {
        let submittedAnswers = getSubmittedAnswer();
        submittedAnswers.push(ansObj);

        fs.writeFileSync("./db/answers.json", JSON.stringify(submittedAnswers), 'utf8');
        return {
            "message": "Successfuly submitted the answer"
        };
    }

    return { "message": "Poll already ended" };

}

function surveyEndPoll(survey_id) {
    let data = fs.readFileSync("./db/surveys.json");
    let surveyList = JSON.parse(data);
    surveyList.forEach(function(survey) {
        if (survey.survey_id == survey_id) {
            survey.end = true;
        }
    });
    fs.writeFileSync("./db/surveys.json", JSON.stringify(surveyList), 'utf8');
}

function surveyPublishPoll(survey_id) {
    let data = fs.readFileSync("./db/surveys.json");
    let surveyList = JSON.parse(data);
    let publishedSurvey = {};
    surveyList.forEach(function(survey) {
        if (survey.survey_id == survey_id) {
            survey.published = true;
            publishedSurvey = survey;
        }
    });
    fs.writeFileSync("./db/surveys.json", JSON.stringify(surveyList), 'utf8');

    let answersData = fs.readFileSync("./db/answers.json");
    let answersJson = JSON.parse(answersData);

    let publishedObj = {};

    answersJson.forEach(function(answer) {
        if (answer.survey_id == survey_id) {
            if (publishedObj[answer.answer_id]) {
                publishedObj[answer.answer_id] += 1;
            } else {
                publishedObj[answer.answer_id] = 1;
            }
        }
    });

    let response = [];
    for (key in publishedObj) {
        let obj = {
            text: publishedSurvey.answers.filter((ans) => ans.id == key)[0].text,
            count: publishedObj[key]
        }
        response.push(obj);
    }
    return response;
}

module.exports = {
    createSurvey: createSurvey,
    getSurveyList: getSurveyList,
    getSurveyById: getSurveyById,
    getSurveysByMeetingId: getSurveysByMeetingId,
    getSurveysByPresenterId: getSurveysByPresenterId,
    getLatestSurveyByMeetingId: getLatestSurveyByMeetingId,
    surveryAnswerSubmit: surveryAnswerSubmit,
    surveyEndPoll: surveyEndPoll,
    surveyPublishPoll: surveyPublishPoll
};