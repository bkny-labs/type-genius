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
  private hintContainer: HTMLDivElement;
  private options: Options;
  private textAreaHint: TextareaHint;

  constructor() {
    this.textAreaHint = new TextareaHint();
    this.textAreaHint.addElements();
  }

  addListeners() {
    this.debouncedRequestLoader = debounce(this.loadRequest.bind(this), 1000);
    // Define the event listener code as a separate function
    this.handleKeyUp = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      // console.log('handleKeyUp', event);
      if (event.key === 'Escape') {
        this.currentHint = '';
        this.hideHint();
      } else if (event.key === 'ArrowRight') {
        // TODO: Handle tab
        this.applyHint();
      } else {
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

    document.addEventListener('keyup', this.handleKeyUp);
  }

  applyHint() {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    activeElement.value += this.currentHint;
    this.currentHint = '';
    this.hideHint();
  }

  dispose() {
    document.removeEventListener('keyup', this.handleKeyUp);
    document.body.removeChild(this.hintContainer);
    this.hintContainer = null;
  }

  hideHint() {
    this.hintContainer.style.display = 'none';
    this.textAreaHint.hide();
  }

  init() {
    this.hintContainer = document.createElement('div');
    document.body.appendChild(this.hintContainer);
    this.hintContainer.className = 'type-genius-hint';
    this.hintContainer.style.display = 'none';
    this.addListeners();
  }

  loadRequest(field: string, payload: string) {
    if (this.apiKey !== undefined) {
      return this.loadApiRequest(field, payload);
    } else {
      return this.loadFunctionsRequest(field, payload);
    }
  }
  
  loadApiRequest(field: string, payload: string) {
    const options = {
      "model": "text-davinci-002",
      "max_tokens": 10,
      "temperature": 0.5,
      "top_p": 0.5,
      "n": 1,
      "stream": false,
      "stop": "\n",
      "prompt": payload,
      ...this.options
    };
    console.log('options', options);
    console.log('options', this.options);
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
      this.currentHint = data.choices[0].text;
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
        this.currentHint = data.payload.text;
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
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (activeElement instanceof HTMLTextAreaElement) {
      this.textAreaHint.setHint(this.currentHint);
      this.textAreaHint.setInput(activeElement);
      this.textAreaHint.show();
    } else {
      const boundingBox = activeElement.getBoundingClientRect();
      this.hintContainer.style.display = 'block';
      this.hintContainer.style.top = `${boundingBox.bottom + window.scrollY}px`;
      this.hintContainer.style.left = `${boundingBox.left}px`;
      this.hintContainer.innerText = this.currentHint;
    }

  }
}
