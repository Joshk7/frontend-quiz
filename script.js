const root = document.documentElement;
const darkBackground = document.getElementById("dark");
const menuList = document.getElementById("menu-list");
const subject = document.getElementById("subject");
const theme = document.getElementById("control");
const sun = document.getElementById("sun");
const moon = document.getElementById("moon");

const menu = document.getElementById("menu");
const question = document.getElementById("question");
const questionCurrent = document.getElementById("question-current");
const questionAmount = document.getElementById("question-amount");
const progressBar = document.getElementById("progress-bar")
const questionDescription = document.getElementById("question-description");
const letterMap = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
};
const questionForm = document.getElementById("question-form");
const options = document.getElementById("options");
const submitQuestion = document.getElementById("submit-question");
const error = document.getElementById("error");

const complete = document.getElementById("complete");
const completeSubject = document.getElementById("complete-subject");
const scoreTotal = document.getElementById("score-total");
const questionTotal = document.getElementById("question-total");
const completeButton = document.getElementById("complete-button");

let quizzes = [];
let quizIndex = -1;
let questions = [];
let score = 0;
let questionIndex = 0;
let selectedOption = null;
let correctOption = null;
let answered = false;

const fetchData = async () => {
    try {
        const response = await fetch("/data.json");
        if (!response.ok) {
            throw new Error("Unable to fetch data");
        }
        const result = await response.json();
        quizzes = result.quizzes;
        renderQuizzes();
    } catch (error) {
        menuList.innerHTML = `<li class="fetch__error">${error.message}</li>`;
    }
};

const handleThemeClick = (e) => {
    darkBackground.classList.toggle("invisible");
    root.classList.toggle("dark");
    if (root.classList.contains("dark")) {
        sun.src = "/assets/images/icon-sun-light.svg";
        moon.src = "/assets/images/icon-moon-light.svg";
    } else {
        sun.src = "/assets/images/icon-sun-dark.svg";
        moon.src = "/assets/images/icon-moon-dark.svg";
    }
}

theme.addEventListener("click", handleThemeClick);

const renderQuizzes = () => {
    if (quizzes.length === 0) {
        return;
    }
    quizzes.forEach((quiz, index) => {
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        button.classList.add("list__button");
        button.setAttribute("data-quiz", index);
        button.innerHTML = `
            <img class="subject__icon" src="${quiz.icon}" alt="Icon" />
            <span class="subject__title">${quiz.title}</span>
        `;
        button.addEventListener("click", handleMenuClick);
        listItem.appendChild(button);
        menuList.appendChild(listItem);
    });
};

const handleMenuClick = (e) => {
    const button = e.target.closest("button");
    const index = button.getAttribute("data-quiz");
    quizIndex = index;
    const quiz = quizzes[index];
    subject.innerHTML = `
        <img class="subject__icon" src="${quiz.icon}" alt="Subject" />
        <span class="subject__title">${quiz.title}</span>
    `;
    questions = quiz.questions;
    menu.classList.add("invisible");
    renderQuestion();
};

const renderQuestion = () => {
    const currentQuestion = questions[questionIndex];
    const currentOptions = currentQuestion.options;
    const currentAnswer = currentQuestion.answer;
    const percentComplete = ((questionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${percentComplete}%`;

    if (questionIndex === 0) {
        questionAmount.textContent = questions.length;
    }

    questionCurrent.textContent = questionIndex + 1;

    if (question.classList.contains("invisible")) {
        question.classList.remove("invisible");
    }

    while (options.firstChild.id !== "submit") {
        options.removeChild(options.firstChild);
    }

    questionDescription.textContent = currentQuestion.question;
    currentOptions.forEach((option, index) => {
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        button.classList.add("list__button");
        button.type = "button";
        const letter = document.createElement("span");
        letter.classList.add("letter");
        letter.textContent = letterMap[index];
        const optionDescription = document.createElement("p");
        optionDescription.classList.add("option");
        optionDescription.textContent = option;

        button.addEventListener("click", handleQuestionClick);
        button.appendChild(letter);
        button.appendChild(optionDescription);
        if (option === currentAnswer) {
            correctOption = button;
        }
        listItem.appendChild(button);
        options.insertBefore(listItem, submitQuestion.parentElement);
    });

    submitQuestion.textContent = "Submit Answer";
};

const handleQuestionClick = (e) => {
    e.preventDefault();
    if (!error.classList.contains("invisible")) {
        error.classList.add("invisible");
    }

    const button = e.target.closest("button");
    if (selectedOption !== null) {
        selectedOption.classList.remove("list__button--selected");
        selectedOption.firstElementChild.classList.remove("letter--selected");
    }

    selectedOption = button;
    selectedOption.classList.add("list__button--selected");
    selectedOption.firstElementChild.classList.add("letter--selected");
};

const handleSubmitQuestion = (e) => {
    e.preventDefault();
    if (answered) {
        answered = false;
        questionIndex++;
        if (questionIndex === questions.length) {
            question.classList.add("invisible");
            renderComplete();
        } else {
            renderQuestion();
        }
        return;
    }

    if (selectedOption === null) {
        error.classList.remove("invisible");
    } else {
        answered = true;
        submitQuestion.textContent = "Next Question";

        options.querySelectorAll(".list__button").forEach((button) => {
            button.disabled = true;
        });

        if (correctOption !== selectedOption) {
            const incorrect = document.createElement("img");
            incorrect.classList.add("incorrect");
            incorrect.src = "/assets/images/icon-incorrect.svg";
            incorrect.alt = "Incorrect";
            selectedOption.appendChild(incorrect);

            selectedOption.classList.add("list__button--incorrect");
            selectedOption.firstElementChild.classList.add("letter--incorrect");
        } else {
            score += 1;
            selectedOption.classList.add("list__button--correct");
            selectedOption.firstElementChild.classList.add("letter--correct");
        }

        const correct = document.createElement("img");
        correct.classList.add("correct");
        correct.src = "/assets/images/icon-correct.svg";
        correct.alt = "Correct";
        correctOption.appendChild(correct);
        selectedOption = null;
        correctOption = null;
    }
};

questionForm.addEventListener("submit", handleSubmitQuestion);

const renderComplete = () => {
    const quiz = quizzes[quizIndex];
    completeSubject.innerHTML = `
        <img class="subject__icon" src="${quiz.icon}" alt="Subject" />
        <span class="subject__title">${quiz.title}</span>
    `;
    scoreTotal.textContent = score;
    questionTotal.textContent = questions.length;
    complete.classList.remove("invisible");
};

const handleCompleteClick = (e) => {
    complete.classList.add("invisible");
    quizIndex = -1;
    questions = [];
    score = 0;
    questionIndex = 0;
    answered = false;
    subject.innerHTML = "";
    menu.classList.remove("invisible");
};

completeButton.addEventListener("click", handleCompleteClick);

fetchData();
