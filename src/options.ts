import '../styles/options.scss';

const textarea = document.querySelector('.custom-textarea') as HTMLTextAreaElement;
const suggestionText = document.querySelector('.suggestion-text') as HTMLElement;
const hiddenText = document.querySelector('.hidden-text') as HTMLElement;

// Sample suggestions
const suggestions: { [key: string]: string } = {
    "hello": "hello world.",
    "what": "what the actual fuck is going on in here?",
};

function getSuggestion(word: string): string {
    return Object.prototype.hasOwnProperty.call(suggestions, word) ? suggestions[word] : '';
}

function escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getInputWidth(inputText: string): number {
    hiddenText.textContent = inputText;
    return hiddenText.getBoundingClientRect().width;
}

textarea.addEventListener('input', function () {
    const words = textarea.value.split(' ');
    const lastWord = words.slice(-1)[0] || '';
    const suggestion = getSuggestion(lastWord);
    
    if (suggestion) {
        const userText = escapeHTML(textarea.value);
        const highlightedSuggestion = `<span style="color:#999">${escapeHTML(suggestion.substring(lastWord.length))}</span>`;
        suggestionText.innerHTML = userText + highlightedSuggestion;
        const inputWidth = getInputWidth(userText);
        suggestionText.style.left = `${inputWidth}px`;
    } else {
        suggestionText.textContent = '';
    }
});

function getSuggestedValue(): string {
    const words = textarea.value.split(' ');
    const lastWord = words.slice(-1)[0] || '';
    const suggestion = getSuggestion(lastWord);
    return suggestion ? textarea.value.substring(0, textarea.selectionStart) + suggestion.substring(lastWord.length) : '';
}

let tabUsedForSuggestion = false;

textarea.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') {
        const suggestedValue = getSuggestedValue();
        if (suggestedValue && !tabUsedForSuggestion) {
            event.preventDefault(); // Prevent default behavior (moving focus to the next input element)
            textarea.value = suggestedValue;
            textarea.dispatchEvent(new Event('input')); // Trigger the input event to update the suggestion
            tabUsedForSuggestion = true;
        } else {
            tabUsedForSuggestion = false;
        }
    } else {
        tabUsedForSuggestion = false;
    }
});


// form.ts
function saveOptions(): void {
    console.log("SAVE OPTIONS");
    const form = document.getElementById('optionsForm') as HTMLFormElement;
    const options = {
      model: (form.elements.namedItem('model') as HTMLSelectElement).value,
      max_tokens: parseInt((form.elements.namedItem('max_tokens') as HTMLInputElement).value, 10),
      temperature: parseFloat((form.elements.namedItem('temperature') as HTMLInputElement).value),
      top_p: parseFloat((form.elements.namedItem('top_p') as HTMLInputElement).value),
      n: parseInt((form.elements.namedItem('n') as HTMLInputElement).value, 10),
      stream: (form.elements.namedItem('stream') as HTMLInputElement).checked,
      stop: (form.elements.namedItem('stop') as HTMLInputElement).value,
      prompt: (form.elements.namedItem('prompt') as HTMLTextAreaElement).value,
    };
  
    localStorage.setItem('options', JSON.stringify(options));
    alert('Options saved to localStorage.');
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
    saveButton.addEventListener('click', saveOptions);
  });
  
  export { saveOptions };
  
