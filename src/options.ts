import '../styles/options.scss';

window.addEventListener('load', () => {
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
      saveButton.addEventListener('click', saveOptions);
    } else {
      console.error('Save button not found in the DOM');
    }
  });

function saveOptions(): void {
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
    console.log('Options saved to localStorage.');
}

  export { saveOptions };
  
