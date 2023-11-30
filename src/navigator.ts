interface Answer {
	questionId: number;
	value: string | number;
}

interface Question {
	id: number;
	text: string;
	options: string[];
	answer?: string;
}

export default class Quiz {
	private _answers: Answer[] = [];
	private _questions: Question[] = [];
	private _currentQuestionIndex: number = 0;

	constructor() {}

	initalize(): void {
		this.fetchQuestions();
		this.addEventListeners();
		QuizUIManager.setTotalQuestions(this._questions.length.toString());
		this.updateUI();
	}

	fetchQuestions(): Question[] {
		const questions: Question[] = [];
		for (let i = 1; i < 51; i++) {
			questions.push({ id: i, text: `Hi there ${i} ${Math.random()}`, options: ["name", "test"] });
		}
		this._questions = questions;
		return this._questions;
	}

	addEventListeners(): void {
		QuizUIManager.prevQuestionButton.addEventListener("click", (): void => {
			this.updateCurrentQuestion(this._currentQuestionIndex - 1);
		});
		QuizUIManager.nextQuestionButton.addEventListener("click", (): void => {
			this.updateCurrentQuestion(this._currentQuestionIndex + 1);
		});
		QuizUIManager.questionOptions.addEventListener("input", (event: Event): void => {
			const target = event.target as HTMLInputElement;
			const questionId: number = Number(target.dataset.question);
			this.setAnswer(questionId, target.value);
		});
		QuizUIManager.questionBullets.addEventListener("click", (event: Event): void => {
			const target = event.target as HTMLInputElement;
			const questionId: number = Number(target.dataset.question);
      if (target.tagName === "SPAN") {
        const questionIndex = this._questions.findIndex(({ id }) => id === questionId);
        this.updateCurrentQuestion(questionIndex);
      }
		});
	}

	updateCurrentQuestion(questionIndex: number) {
		if (questionIndex < 0 || questionIndex >= this._questions.length) return;
		this._currentQuestionIndex = questionIndex;
		this.updateUI();
	}

	setAnswer(questionId: number, answer: string | number) {
		const currentAnswer = this._answers.find((answer) => (answer.questionId === questionId));
		if (currentAnswer) {
			currentAnswer.value = answer;
		} else {
			this._answers.push({ questionId, value: answer });
		}
	}

	getAnswer(questionId: number): Answer | null {
		const answer = this._answers.find((answer) => answer.questionId === questionId);
		return answer ?? null;
	}

	updateUI(): void {
		const currentQuestion: Question = this._questions[this._currentQuestionIndex];
		if (currentQuestion) {
			QuizUIManager.updateCurrentQuestion(currentQuestion, this.getAnswer(currentQuestion.id));
			QuizUIManager.updateQuestionQuickNavigator(this._questions, this._answers, this._currentQuestionIndex);
		}
	}
}

class QuizUIManager {
	static questionText = <HTMLDivElement>document.querySelector("#questionText");
	static questionOptions = <HTMLDivElement>document.querySelector("#questionOptions");
	static questionBullets = <HTMLDivElement>document.querySelector("#questionBullets");

	static prevQuestionButton = <HTMLButtonElement>document.querySelector("#prevQuestionButton");
	static nextQuestionButton = <HTMLButtonElement>document.querySelector("#nextQuestionButton");

	static totalQuestionCounter = <HTMLSpanElement>document.querySelector("#totalQuestions");
	static currentQuestionsCounter = <HTMLSpanElement>document.querySelector("#currentQuestion");

	static setTotalQuestions(totalQuestions: string): void {
		QuizUIManager.totalQuestionCounter.textContent = totalQuestions;
	}

	static updateCurrentQuestion(question: Question, answer: Answer | null): void {
		const { text, options } = question;
		QuizUIManager.questionText.textContent = text;

		let optionsHTMLString: string = "";
		for (let i = 0; i < options.length; i++) {
			optionsHTMLString += `
        <div class="option my-2">
          <input
            type="radio"
            name="answer-${question.id}"
            value="${options[i]}"
            id="option-${question.id}-${i + 1}"
            data-question="${question.id}"
            ${answer && answer.value === options[i] ? "checked" : ""}
          >
          <label for="option-${question.id}-${i + 1}">${options[i]}</label>
        </div>
      `;
		}
		QuizUIManager.questionOptions.innerHTML = optionsHTMLString;
	}

	static updateQuestionQuickNavigator(questions: Question[], answers: Answer[], currentQuestionIndex: number): void {
		let bulletHTMLString: string = "";

		for (let i = 0; i < questions.length; i++) {
			let btnStyle = "red-600";
			if (answers.find((answer) => answer.questionId === questions[i].id)) {
				btnStyle = "green-600";
			}

			if (i === currentQuestionIndex) {
				btnStyle = "orange-500";
			}

			bulletHTMLString += `
        <span
          class="bullet cursor-pointer inline-block py-1 px-2 mb-1 text-xs rounded bg-${btnStyle}"
          data-question="${questions[i].id}"
        >
          ${i + 1}
        </span>
      `;
		}

		QuizUIManager.questionBullets.innerHTML = bulletHTMLString;
	}
}
