import { QuizUIManager } from "./quiz-ui-manager";
import { Answer, Question, ApiQuestion } from "./types/interfaces";

class Quiz {
	private _answers: Answer[] = [];
	private _questions: Question[] = [];
	private _currentQuestionIndex: number = 0;

	constructor() {}

	async initalize(): Promise<void> {
		await this.fetchQuestions();
		this.addEventListeners();
		QuizUIManager.setTotalQuestions(this._questions.length.toString());
		this.updateUI();
	}

	async fetchQuestions(): Promise<Question[]> {
		try {
			const response = await fetch('https://opentdb.com/api.php?amount=50');

			if (!response.ok) {
				throw new Error(`Error fetching questions. Status: ${response.status}`);
			}

			const data = await response.json();

			const apiQuestions: ApiQuestion[] = data.results;

			console.log(apiQuestions);

			const questions: Question[] = apiQuestions.map((apiQuestion: any, index: number) => ({
				id: index + 1,
				text: apiQuestion.question,
				options: [...apiQuestion.incorrect_answers, apiQuestion.correct_answer],
			}));
			this._questions = questions;
			return this._questions;
		} catch (error: any) {
			console.error('Error fetching questions:', error?.message);
			throw error;
		}
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