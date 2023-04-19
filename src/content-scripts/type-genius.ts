import { debounce } from 'lodash';

import { blacklistFields } from '../models/constants';
import { Options } from '../models/options';
import { TextareaHint } from './textarea-hint';

export class TypeGenius {
  private apiKey: string = undefined;
  private currentHint = '';
  private debouncedRequestLoader: (field: string, text: string) => void;
  private enabled = false;
  private handleKeyUp: (event: KeyboardEvent) => void;
  private handleKeyDown: (event: KeyboardEvent) => void;
  
  private options: Options;
  private textAreaHint: TextareaHint;

  private defaultTemplate = 'Complete the field "${input_name}"\nField value: "${input_text}';

  addListeners() {
    this.debouncedRequestLoader = debounce(this.loadRequest.bind(this), 1000);
    // Define the event listener code as a separate function
    this.handleKeyUp = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      // console.log('handleKeyUp', event);
      if (event.key !== 'Escape' && event.key !== 'Tab') {
        // Check if the activeElement is an input or textarea element
        if (activeElement.tagName === 'TEXTAREA') {
          // Check blacklist
          const isBlacklisted = blacklistFields.some((pattern) => {
            if (pattern instanceof String) {
              return pattern.toLowerCase() === activeElement.name.toLowerCase();
            } else if (pattern instanceof RegExp) {
              return pattern.test(activeElement.name);
            } else {
              return false; // ignore invalid entries in the array
            }
          });
          
          if (!isBlacklisted) {
            this.currentHint = '';
            this.hideHint();
            this.debouncedRequestLoader(activeElement.name, activeElement.value);
          }
        }
      }
    }

    this.handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.currentHint = '';
        this.hideHint();
      } else if (event.key === 'Tab') {
        if (this.currentHint.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          this.applyHint();
        }
      }
    }

    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  applyHint() {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    activeElement.value += this.currentHint;
    this.currentHint = '';
    this.hideHint();
    // Run next completion
    this.debouncedRequestLoader(activeElement.name, activeElement.value);
  }

  dispose() {
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  hideHint() {
    this.textAreaHint.hide();
  }

  init() {
    this.textAreaHint = new TextareaHint();
    this.textAreaHint.addElements();
    
    this.addListeners();
  }

  loadRequest(field: string, payload: string) {
    if (payload.length > 0) {
      if (this.apiKey !== undefined) {
        return this.loadApiRequest(field, payload);
      }
    }
  }

  renderPromptTemplate(field: string, payload: string, prompt_template = this.defaultTemplate) {
    // console.log("template: ", prompt_template);
    let template = prompt_template;
    const ctx: any = {
      'input_name': field,
      'input_text': payload,
      'model_name': this.options.model,
      'stop': this.options.stop,
    }
    for (const key in ctx) {
      const value = ctx[key];
      template = template.replaceAll('${' + key + '}', value);
    }
    // console.log('rendered:', template);
    return template.replace('${field}', field).replace('${payload}', payload);
  }
  
  loadApiRequest(field: string, payload: string) {
    // const prompt = `Complete the field "${field}"\nField value: "${payload}`;
    const { prompt_template, ...opts } = this.options;
    // console.log('opts', opts);
    const prompt = this.renderPromptTemplate(field, payload, prompt_template);
    const options = {
      "model": "text-davinci-002",
      "max_tokens": 10,
      "temperature": 0.5,
      "top_p": 0.5,
      "n": 1,
      "stream": false,
      "stop": '"',
      "prompt": prompt,
      // "suffix": '"',
      ...opts
    };
    const payloadWhitespace = /\s/.test(payload[payload.length - 1]);

    return fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(options)
    })
    .then(response => response.json())
    .then(data => {
      // console.log(data);
      const response = data.choices[0].text;
      const whitespace = payloadWhitespace === false && /\s/.test(response[0]) ? ' ':'';
      this.currentHint = whitespace + response.trim();
      this.showHint();
    })
    .catch(error => console.error(error));
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  setEnabled(enabled: boolean) {
    if (this.enabled !== enabled) {
      this.enabled = enabled;
      if (enabled === true) {
        this.init();
      } else {
        this.dispose();
      }
    }
  }

  setOptions(options: Options) {
    this.options = options;
  }

  showHint() {
    if (this.currentHint.length > 0) {
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeElement instanceof HTMLTextAreaElement) {
        this.textAreaHint.setInput(activeElement);
        this.textAreaHint.setHint(this.currentHint);
        this.textAreaHint.show();
      }
    }
  }
}
