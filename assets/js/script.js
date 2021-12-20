//https://opentdb.com/api.php
let questions = [];
let answersCorrectAndIncorrects = [];
let checkedAnswers = [];
let currentQuestionIndex = 0;
let interval = null;
let difficultyGlobalValue= {
    easy : 20,
    medium : 60,
    hard : 300
}
document.addEventListener("DOMContentLoaded", function(event) {
    getQuestionFromApi();
    onClickNextButton();
});

//Fetch Data from API
function getQuestionFromApi() {
    //CORS issue occurred when testing on local machine, i had to create a server local to access the url but for your test,
    // please you add this to avoid the CORS error but need to be approved here
    // https://cors-anywhere.herokuapp.com/corsdemo and click the button
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
    let url = "https://opentdb.com/api.php?amount=5&type=multiple";
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    };

    fetch(proxyUrl + url, requestOptions)
        .then(response => response.json())
        .then((response) => {
            if (response) {
                if (response.response_code === 0) {
                    onSuccess(response.results);
                } else {
                    onFail(response.results);
                }
            }
        }).catch((error) => {
        onFail(error);
    });
}

//Show error when fetching data is failed
function onFail (data) {
    console.error("An Error occured when fetching data", data);
    alert("An Error occured when fetching data");
}

//Perform action needed when fetching data is success
function onSuccess (data) {
    questions = data;
    if(questions) {
        //Move to first question, parameter set to false as it is not the next question
        moveToNextQuestion(false);
    }
}

//Show container of data when all data are retrieved from API
function showContainer (){
    const contentMenu = document.getElementsByClassName("content-menu");
    if(contentMenu) {
        contentMenu[0].classList.remove("hide");
    }
    document.getElementById("loader").classList.add("hide");
}

//Function to append a new html for an element
function setHtml(element, key, question) {
    if (element && element.length > 0) {
        element[0].innerHTML = question[key];
    }
}

//update timer according to difficulty
function setTimerAccordingToDifficulty (difficulty) {
    const difflvl = document.getElementsByClassName("difflvl");
    if(difflvl) {
        Array.prototype.filter.call(difflvl, function(level){
            level.classList.add("hide");
        });
    }
    switch (difficulty) {
        case 'easy':
            document.getElementById('easy').classList.remove('hide');
            setTimeOut(difficultyGlobalValue.easy);
            break;
        case 'medium' :
            document.getElementById('medium').classList.remove('hide');
            setTimeOut(difficultyGlobalValue.medium);
            break;
        case 'hard':
            document.getElementById('hard').classList.remove('hide');
            setTimeOut(difficultyGlobalValue.hard);
            break;
        default :
    }
}

// convert float to int eg: 4,75 => 4
function float2int (value) {
    return value | 0;
}

// get a random value from two specific number
function getRandomValue (min, max) {
    const value = Math.floor(Math.random() * (max - min)) + min;
    return value;
}

// change content of timer ever one second
function setTimeOut(difficultyValue) {
        interval = setInterval(function () {
        let timer = document.getElementsByClassName("time-left")[0];
        difficultyValue = difficultyValue - 1;
        //Change the color of timer to red when time is less than 10s
        if(difficultyValue <= 10) {
            timer.classList.add("warning");
        }
        //format value of timer is timer is more thant 1min
        if(difficultyValue > 60) {
            const intValue = float2int(difficultyValue / 60);
            const valueAfterComa = float2int(((difficultyValue / 60) - intValue) * 60);
            const htmlValue = `0${intValue}:${valueAfterComa}`;
            timer.innerHTML = htmlValue;
        }
        else {
            if(difficultyValue < 10)
                timer.innerHTML = `00:0${difficultyValue}`;
            else
                timer.innerHTML = `00:${difficultyValue}`;
        }
        //stop interval when timer is equal to 0 and if no answer is chose add null and move to the next question
        if(difficultyValue === 0) {
            clearInterval(interval);
            if(!checkedAnswers[currentQuestionIndex]) {
                checkedAnswers[currentQuestionIndex] = null;
            }
            moveToNextQuestion();
        }
    }, 1000);
}

//Show answer according to question
function appendAnswers(question) {
    const correctAnswer = question.correct_answer;
    const incorrectAnswer = question.incorrect_answers;
    const lengthOfAnswers = incorrectAnswer.length + 1;
    //Put the correct answer in a random place
    const randomValue = getRandomValue(0, lengthOfAnswers);
    let j = 0;
    let results = [];
    for(let i = 0; i< lengthOfAnswers; i++) {
        if(i === randomValue) {
            results[i] = correctAnswer;
        }
        else {
            results[i] = incorrectAnswer[j];
            j++;
        }
    }
    const answerContent = document.getElementsByClassName("answer-container")[0];
    let htmlContent = '';

    //store answers with correct and incorrect for result
    answersCorrectAndIncorrects.push(results);

    results.map((result) => {
        htmlContent += `<div class='answer'><label><input type='radio' name='answer' value='${result}'><span>${result}</span></label></div>`;
    });
    answerContent.innerHTML = htmlContent;

    //onclick is accessible when answer is appended in the DOM
    onClickInputAnswer();
}

//Move to the next question when clickin next button or when time is out
function moveToNextQuestion (next = true){
    if(next) currentQuestionIndex = currentQuestionIndex + 1;
    if(currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        //show container
        showContainer();

        //set category
        const categoryTitle = document.getElementsByClassName("category-title");
        setHtml(categoryTitle, "category", question);

        //set Question
        const questionValue = document.getElementsByClassName("question");
        setHtml(questionValue, "question", question);

        //set Answers
        appendAnswers(question);

        setTimerAccordingToDifficulty(question.difficulty);
    }
    else {
        //Show result
        console.log("show result");
        showResult();

    }
}

// function triggered when a radiobox is click for an answer of a question
function onClickInputAnswer() {
    const answers = document.forms["formAnswer"].elements["answer"];
    for(let i = 0; i<answers.length; i++) {
        answers[i].onclick = function () {
            checkedAnswers[currentQuestionIndex] = this.value;
        };
    }
}

// function triggered on click the next button
function onClickNextButton() {
    const nextButton = document.getElementById("next");
    nextButton.onclick = function () {
        if(!checkedAnswers[currentQuestionIndex]) {
            checkedAnswers[currentQuestionIndex] = null;
        }
        if(interval)
            clearInterval(interval);
        moveToNextQuestion();
    }
}

//show last result according to user responses
function showResult() {
    const result = document.getElementsByClassName("results")[0];
    const resultContainer = document.getElementsByClassName("result-container")[0];
    const questionContainer = document.getElementsByClassName("question-container")[0];
    //remove question from DOM
    questionContainer.remove();
    resultContainer.classList.remove("hide");
    let htmlContent = '';
    for(let i = 0; i<questions.length; i++) {
        const question = questions[i];
        const answerOfQuestion = checkedAnswers[i];

        htmlContent += `<div class="accordion-parent">
                            <button  class="accordion active">${question.question}</button>
                            <div class="panel active">
                                <div class="accordion-response">
                                    ${buildAnswersRender(answerOfQuestion,question.correct_answer,answersCorrectAndIncorrects[i])}
                                </div>
                            </div>
                        </div>`;
    }
    result.innerHTML = htmlContent;

}

//Build answer detail green if correct, red if not correct
function buildAnswersRender(answerOfQuestion, validAnswer, answerList = []) {
    const correctNumber = document.getElementsByClassName("correct-number")[0];
    let correctNumberValue = 0;
    let htmlContent = '<ul>';
    answerList.map(answer => {
        if((answer === answerOfQuestion && validAnswer === answerOfQuestion)
            || (answer !== answerOfQuestion && answer === validAnswer)) {
            htmlContent += `<li style="color: green; font-weight: bold">${answer}</li>`;
            if (answer === answerOfQuestion) correctNumberValue += 1;
        }
        if(answer === answerOfQuestion && validAnswer !== answerOfQuestion)
            htmlContent += `<li style="color: red; font-weight: bold">${answer}</li>`;
        else
            htmlContent += `<li>${answer}</li>`;
    });
    if(answerOfQuestion === null){
        htmlContent += `<li style="color: red; font-weight: bold">No answer.</li>`;
    }
    htmlContent += '</ul>';
    correctNumber.innerHTML = `${correctNumberValue} / ${answerList.length + 1}`;
    return htmlContent;
}
