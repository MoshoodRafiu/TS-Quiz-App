export interface Answer {
	questionId: number;
	value: string | number;
}

export interface Question {
	id: number;
	text: string;
	options: string[];
	answer?: string;
}

export interface ApiQuestion {
	question: String,
	correct_answer: string,
	incorrect_answers: string[],
}