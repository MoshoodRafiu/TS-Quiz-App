import { QuizUIManager } from "./quiz-ui-manager";
import { Answer, Question } from "./types/interfaces";

class Quiz {
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

export default new Quiz;