export interface Options {
  model: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  n: number;
  stream: boolean;
  stop: string;
  prompt_template: string;
}
