interface Question {
	text: string;
	options: string[];
	answer?: string;
}

export function initQuiz() {
	quizQuestions = getQuizQuestions();

	updateQuizUi();
	totalQuestionCounter.textContent = quizQuestions.length.toString();

	prevQuestionButton.addEventListener("click", showPrevQuestion);
	nextQuestionButton.addEventListener("click", showNextQuestion);
	questionOptions.addEventListener("input", (event: Event) => {
		const target = event.target as HTMLInputElement;
		const questionIndex: number = Number(target.dataset.question);
		quizQuestions[questionIndex].answer = target.value;
	});
	questionBullets.addEventListener("click", (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.tagName === "SPAN") {
			const questionIndex: number = Number(target.dataset.question);
			showQuestion(questionIndex);
		}
	});
}

function showPrevQuestion(): void {
	if (currentQuestionIndex === 0) return;
	showQuestion(currentQuestionIndex - 1);
}

function showNextQuestion(): void {
	if (currentQuestionIndex === quizQuestions.length - 1) return;
	showQuestion(currentQuestionIndex + 1);
}

function showQuestion(questionIndex: number): void {
	if (questionIndex < 0 || questionIndex >= quizQuestions.length) return;
	currentQuestionIndex = questionIndex;
	updateQuizUi();
}

function getQuizQuestions(): Question[] {
	const questions: Question[] = [];
	for (let i = 1; i < 51; i++) {
		questions.push({ text: `Hi there ${i} ${Math.random()}`, options: ["name", "test"] });
	}
	return questions;
}

function updateQuizUi(): void {
	const { text, options, answer } = quizQuestions[currentQuestionIndex];
	questionText.textContent = text;

	currentQuestionsCounter.textContent = (currentQuestionIndex + 1).toString();

	updateQuestionOptionsUI(questionOptions, options, answer ?? "");
	updateBottomQuestionNavigator(questionBullets, quizQuestions, currentQuestionIndex);
}

function updateQuestionOptionsUI(questionOptionsWrapper: HTMLDivElement, options: string[], answer: string): void {
	let optionsHTMLString: string = "";
	for (let i = 0; i < options.length; i++) {
		optionsHTMLString += `
      <div class="option my-2">
        <input
          type="radio"
          name="answer-${currentQuestionIndex}"
          value="${options[i]}"
          id="option-${currentQuestionIndex}-${i + 1}"
          data-question="${currentQuestionIndex}"
          ${options[i] === answer ? "checked" : ""}
        >
        <label for="option-${currentQuestionIndex}-${i + 1}">${options[i]}</label>
      </div>
    `;
	}
	questionOptionsWrapper.innerHTML = optionsHTMLString;
}

function updateBottomQuestionNavigator(
	bottomNavigationWrapper: HTMLDivElement,
	questions: Question[],
	currentQuestionIndex: number,
): void {
	let bulletHTMLString: string = "";

	for (let i = 0; i < questions.length; i++) {
		let btnStyle = "red-600";
		if (questions[i].answer) {
			btnStyle = "green-600";
		}

		if (i === currentQuestionIndex) {
			btnStyle = "orange-500";
		}

		bulletHTMLString += `
      <span
        class="bullet cursor-pointer inline-block py-1 px-2 mb-1 text-xs rounded bg-${btnStyle}"
        data-question="${i}"
      >
        ${i + 1}
      </span>
    `;
	}

	bottomNavigationWrapper.innerHTML = bulletHTMLString;
}

let quizQuestions: Question[] = [];
let currentQuestionIndex: number = 0;

const questionText = document.querySelector("#questionText") as HTMLDivElement;
const questionOptions = document.querySelector("#questionOptions") as HTMLDivElement;
const questionBullets = document.querySelector("#questionBullets") as HTMLDivElement;

const prevQuestionButton = document.querySelector("#prevQuestionButton") as HTMLButtonElement;
const nextQuestionButton = document.querySelector("#nextQuestionButton") as HTMLButtonElement;

const totalQuestionCounter = document.querySelector("#totalQuestions") as HTMLSpanElement;
const currentQuestionsCounter = document.querySelector("#currentQuestion") as HTMLSpanElement;
