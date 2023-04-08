import { debounce } from 'lodash';

import { blacklistFields } from '../models/constants';
import { Options } from '../models/options';
import { TextareaHint } from './textarea-hint';
import { InputHint } from './input-hint';

export class TypeGenius {
  private apiKey: string = undefined;
  private currentHint = '';
  private debouncedRequestLoader: (field: string, text: string) => void;
  private enabled = false;
  private handleKeyUp: (event: KeyboardEvent) => void;
  private handleKeyDown: (event: KeyboardEvent) => void;
  
  private options: Options;
  private inputHint: InputHint;
  private textAreaHint: TextareaHint;

  addListeners() {
    this.debouncedRequestLoader = debounce(this.loadRequest.bind(this), 1000);
    // Define the event listener code as a separate function
    this.handleKeyUp = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      // console.log('handleKeyUp', event);
      if (event.key !== 'Escape' && event.key !== 'Tab') {
        // Check if the activeElement is an input or textarea element
        if ((activeElement.tagName === 'INPUT' && activeElement.type === 'text') || activeElement.tagName === 'TEXTAREA') {
          // Check blacklist
          if (blacklistFields.find((element) => element.toLowerCase() === activeElement.name.toLowerCase()) === undefined) {
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
    this.inputHint.hide();
    this.textAreaHint.hide();
  }

  init() {
    this.textAreaHint = new TextareaHint();
    this.textAreaHint.addElements();

    this.inputHint = new InputHint();
    this.inputHint.addElements();
    
    this.addListeners();
  }

  loadRequest(field: string, payload: string) {
    if (payload.length > 0) {
      if (this.apiKey !== undefined) {
        return this.loadApiRequest(field, payload);
      } else {
        return this.loadFunctionsRequest(field, payload);
      }
    }
  }
  
  loadApiRequest(field: string, payload: string) {
    const prompt = `Complete the field "${field}"\nField value: "${payload}`;
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
      ...this.options
    };
    console.log('options', options);
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
      console.log(data);
      const response = data.choices[0].text;
      const whitespace = /\s/.test(response[0]) ? ' ':'';
      this.currentHint = whitespace + response.trim();
      this.showHint();
    })
    .catch(error => console.error(error));
  }

  loadFunctionsRequest(field: string, payload: string) {
    const options = {
      "prompt": payload,
      field,
      payload,
      ...this.options
    };
    return fetch('https://storied-arithmetic-ac0ce0.netlify.app/.netlify/functions/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        this.currentHint = '';
        this.hideHint();
      } else {
        this.currentHint = ' ' + data.payload.text.trim();
        this.showHint();
      }
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
        this.textAreaHint.setHint(this.currentHint);
        this.textAreaHint.setInput(activeElement);
        this.textAreaHint.show();
      } else {
        this.inputHint.setHint(this.currentHint);
        this.inputHint.setInput(activeElement);
        this.inputHint.show();
      }
    }
  }
}
