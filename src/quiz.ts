import { QuizUIManager } from "./quiz-ui-manager";
import { Answer, Question, ApiQuestion } from "./types/interfaces";

class Quiz {
	private _answers: Answer[] = [];
	private _questions: Question[] = [];
	private _currentQuestionIndex: number = 0;

	constructor() {

	}

	async initalize(): Promise<void> {
		this.addEventListeners();
		this.prepareQuiz();
	}

	async prepareQuiz(): Promise<void> {
		const cachedAnswersString: string | null = localStorage.getItem('quizQuestionsAnswers');
		const cachedCurrentionIndex: string | null = localStorage.getItem('currentQuestionIndex');
		this._currentQuestionIndex = cachedCurrentionIndex ? Number(cachedCurrentionIndex) : 0;
		this._answers = cachedAnswersString ? JSON.parse(cachedAnswersString) : [];

		await this.fetchQuestions();
		QuizUIManager.setTotalQuestions(this._questions.length.toString());
		this.updateUI();
	}

	async fetchQuestions(): Promise<Question[]> {
		const storageQuestionsString: string | null = localStorage.getItem('quizQuestions');
		if (storageQuestionsString) {
			this._questions = JSON.parse(storageQuestionsString);
			return this._questions;
		}

		try {
			const response = await fetch('https://opentdb.com/api.php?amount=20');

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
			localStorage.setItem('quizQuestions', JSON.stringify(this._questions));

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
		QuizUIManager.generateNewQuestionsButton.addEventListener('click', async (): Promise<void> => {
			if (confirm('All your current selections will be lost, are you sure you want to generate new questions?')) {
				localStorage.removeItem('quizQuestions');
				localStorage.removeItem('currentQuestionIndex');
				localStorage.removeItem('quizQuestionsAnswers');
				this.prepareQuiz();
			}
		});
	}

	updateCurrentQuestion(questionIndex: number) {
		if (questionIndex < 0 || questionIndex >= this._questions.length) return;
		this._currentQuestionIndex = questionIndex;
		localStorage.setItem('currentQuestionIndex', this._currentQuestionIndex.toString());
		this.updateUI();
	}

	setAnswer(questionId: number, answer: string | number) {
		const currentAnswer = this._answers.find((answer) => (answer.questionId === questionId));
		if (currentAnswer) {
			currentAnswer.value = answer;
		} else {
			this._answers.push({ questionId, value: answer });
		}
		localStorage.setItem('quizQuestionsAnswers', JSON.stringify(this._answers));
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
		}
	}
}

export default new Quiz;