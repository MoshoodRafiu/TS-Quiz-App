import { Answer, Question } from "./types/interfaces";

export class QuizUIManager {
	static questionText = <HTMLDivElement>document.querySelector("#questionText");
	static questionOptions = <HTMLDivElement>document.querySelector("#questionOptions");
	static questionBullets = <HTMLDivElement>document.querySelector("#questionBullets");

	static prevQuestionButton = <HTMLButtonElement>document.querySelector("#prevQuestionButton");
	static nextQuestionButton = <HTMLButtonElement>document.querySelector("#nextQuestionButton");

	static totalQuestionCounter = <HTMLSpanElement>document.querySelector("#totalQuestions");
	static currentQuestionsCounter = <HTMLSpanElement>document.querySelector("#currentQuestion");

	static generateNewQuestionsButton = <HTMLButtonElement>document.querySelector("#generateNewQuestions");

	static setTotalQuestions(totalQuestions: string): void {
		QuizUIManager.totalQuestionCounter.textContent = totalQuestions;
	}

	static updateCurrentQuestion(question: Question, answer: Answer | null): void {
		const { text, options } = question;
		QuizUIManager.questionText.innerHTML = text;

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