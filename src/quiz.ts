import { QuizUIManager } from "./quiz-ui-manager";
import { Answer, Question, ApiQuestion } from "./types/interfaces";

class Quiz {
	private _answers: Answer[] = [];
	private _questions: Question[] = [];
	private _currentQuestionIndex: number = 0;
	private _countdownSeconds: number = 0;
	private _countdownInterval: number | null = null;

	constructor() {}

	async initalize(): Promise<void> {
		this.addEventListeners();
		this.prepare();
	}

	async prepare(): Promise<void> {
		const cachedAnswersString: string | null = localStorage.getItem("quizQuestionsAnswers");
		const cachedCurrentQuestionIndex: string | null = localStorage.getItem("currentQuestionIndex");
		this._currentQuestionIndex = cachedCurrentQuestionIndex ? Number(cachedCurrentQuestionIndex) : 0;
		this._answers = cachedAnswersString ? JSON.parse(cachedAnswersString) : [];

		await this.fetchQuestions();
		this.allocateTimeAndStartCountdown();
		QuizUIManager.setTotalQuestions(this._questions.length.toString());
		this.updateUI();
	}

	reset() {
		clearInterval(this._countdownInterval!);
		localStorage.removeItem("quizQuestions");
		localStorage.removeItem("countdownSeconds");
		localStorage.removeItem("currentQuestionIndex");
		localStorage.removeItem("quizQuestionsAnswers");
		this.prepare();
	}

	allocateTimeAndStartCountdown() {
		const cachedCountdownSeconds: string | null = localStorage.getItem("countdownSeconds");
		this._countdownSeconds = cachedCountdownSeconds
			? Number(cachedCountdownSeconds)
			: this._questions.length * 60 / 2;

		this._countdownInterval = setInterval(() => {
			this._countdownSeconds--;

			localStorage.setItem("countdownSeconds", this._countdownSeconds.toString());
			QuizUIManager.updateCountdownTimer(this._countdownSeconds);

			if (this._countdownSeconds < 0) {
				clearInterval(this._countdownInterval!);
				this.submit();
			}
		}, 1000);
	}

	async fetchQuestions(): Promise<Question[]> {
		const storageQuestionsString: string | null = localStorage.getItem("quizQuestions");
		if (storageQuestionsString) {
			this._questions = JSON.parse(storageQuestionsString);
			return this._questions;
		}

		try {
			const response = await fetch("https://opentdb.com/api.php?amount=20&category=18&difficulty=easy");

			if (!response.ok) {
				throw new Error(`Error fetching questions. Status: ${response.status}`);
			}

			const data = await response.json();
			const apiQuestions: ApiQuestion[] = data.results;

			const questions: Question[] = apiQuestions.map((apiQuestion: any, index: number) => ({
				id: index + 1,
				text: apiQuestion.question,
				answer: apiQuestion.correct_answer,
				options: this.shuffleOptions([...apiQuestion.incorrect_answers, apiQuestion.correct_answer]),
			}));

			this._questions = questions;
			localStorage.setItem("quizQuestions", JSON.stringify(this._questions));

			return this._questions;
		} catch (error: any) {
			console.error("Error fetching questions:", error?.message);
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
		QuizUIManager.generateNewQuestionsButton.addEventListener("click", async (): Promise<void> => {
			if (confirm("All your current selections will be lost, are you sure you want to generate new questions?")) {
				this.reset();
			}
		});
		QuizUIManager.submitQuizButtons.forEach((button: Node): void => {
			button.addEventListener("click", (): void => {
				if (confirm("Are you sure you want to submit?")) {
					this.submit();
				}
			});
		});
	}

	submit() {
		let correctAnswers: number = 0;
		for (let answer of this._answers) {
			if (this._questions.find(({ id }) => id === answer.questionId)?.answer === answer.value) {
				correctAnswers++;
			}
		}
		const totalScore: number = (correctAnswers / this._questions.length) * 100;
		alert(`Your total score is ${totalScore}%`);
		this.reset();
	}

	updateCurrentQuestion(questionIndex: number) {
		if (questionIndex < 0 || questionIndex >= this._questions.length) return;
		this._currentQuestionIndex = questionIndex;
		localStorage.setItem("currentQuestionIndex", this._currentQuestionIndex.toString());
		this.updateUI();
	}

	setAnswer(questionId: number, answer: string | number) {
		const currentAnswer = this._answers.find((answer) => answer.questionId === questionId);
		if (currentAnswer) {
			currentAnswer.value = answer;
		} else {
			this._answers.push({ questionId, value: answer });
		}
		localStorage.setItem("quizQuestionsAnswers", JSON.stringify(this._answers));
	}

	getAnswer(questionId: number): Answer | null {
		const answer = this._answers.find((answer) => answer.questionId === questionId);
		return answer ?? null;
	}

	shuffleOptions(options: string[]): string[] {
		for (let i = options.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[options[i], options[j]] = [options[j], options[i]];
		}
		return options;
	}

	updateUI(): void {
		const currentQuestion: Question = this._questions[this._currentQuestionIndex];
		if (currentQuestion) {
			QuizUIManager.currentQuestionCounter.textContent = (this._currentQuestionIndex + 1).toString();
			QuizUIManager.updateCurrentQuestion(currentQuestion, this.getAnswer(currentQuestion.id));
			QuizUIManager.updateQuestionQuickNavigator(this._questions, this._answers, this._currentQuestionIndex);
			QuizUIManager.togglePrevButtonDisplay(this._currentQuestionIndex === 0);
			QuizUIManager.toggleNextButtonDisplay(this._currentQuestionIndex === this._questions.length - 1);
			QuizUIManager.updateCountdownTimer(this._countdownSeconds);
		}
	}
}

export default new Quiz();
