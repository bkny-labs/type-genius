import '../styles/contentScript.scss';

import { debounce } from 'lodash';

const blacklistFields = [
  'name',
  'firstName',
  'lastName',
  'email',
  'phone',
  'phoneNumber',
  'user',
  'username',
  'password',
  'address',
  'address1',
  'address2',
  'county',
  'country',
  'state',
  'zip',
  'province'
];

class TypeGenius {
  private debouncedRequestLoader: (field: string, text: string) => void;
  private handleKeyUp: (event: KeyboardEvent) => void;
  private hintContainer: HTMLDivElement;
  private currentHint = '';
  private enabled = false;

  addListeners() {
    this.debouncedRequestLoader = debounce(this.loadRequest.bind(this), 1000);
    // Define the event listener code as a separate function
    this.handleKeyUp = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      // console.log('handleKeyUp', event);
      if (event.key === 'Escape') {
        this.hideHint();
      } else if (event.key === 'ArrowRight') {
        // TODO: Handle tab
        this.applyHint();
      } else {
        console.log(activeElement.type);
        // Check if the activeElement is an input or textarea element
        if ((activeElement.tagName === 'INPUT' && activeElement.type === 'text') || activeElement.tagName === 'TEXTAREA') {
          // Check blacklist
          if (blacklistFields.find((element) => element.toLowerCase() === activeElement.name.toLowerCase()) === undefined) {
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
  }

  init() {
    this.hintContainer = document.createElement('div');
    document.body.appendChild(this.hintContainer);
    this.hintContainer.className = 'type-genius-hint';
    this.hintContainer.style.display = 'none';
    this.addListeners();
  }
  
  loadRequest(field: string, payload: string) {
    this.hideHint();

    return fetch('https://xnqrt3dy9f.execute-api.us-east-1.amazonaws.com/dev/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ field, payload })
    })
    .then(response => response.json())
    .then(data => {
      const response: string = data.response;
      console.log(response);
      if (response.startsWith('Error')) {
        this.currentHint = '';
        this.hideHint();
      } else {
        this.currentHint = data.response;
        this.showHint(data.response);
      }
    })
    .catch(error => console.error(error));
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

  showHint(text: string) {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    const boundingBox = activeElement.getBoundingClientRect();
    this.hintContainer.style.display = 'block';
    this.hintContainer.style.top = `${boundingBox.bottom}px`;
    this.hintContainer.style.left = `${boundingBox.left}px`;
    this.hintContainer.innerText = text;
  }
}

const typeGenius = new TypeGenius();

chrome.runtime.onMessage.addListener(message => {
  typeGenius.setEnabled(message.enabled);
});
