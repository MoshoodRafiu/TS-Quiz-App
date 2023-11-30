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