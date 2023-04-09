import '../styles/options.scss';

import { Options } from './models/options';
import { getStorageData, setStorageItem } from './utils/storage';
import { refreshData } from './utils/refresh-data';

const loadStorage = () => getStorageData().then(data => {
  const options: Options = data.options;
  const form = document.getElementById('optionsForm') as HTMLFormElement;
  (form.elements.namedItem('apiKey') as HTMLInputElement).value = data.apiKey;
  (form.elements.namedItem('model') as HTMLSelectElement).value = options.model;
  (form.elements.namedItem('max_tokens') as HTMLInputElement).value = options.max_tokens + '';
  (form.elements.namedItem('temperature') as HTMLInputElement).value = options.temperature + '';
  (form.elements.namedItem('top_p') as HTMLInputElement).value = options.top_p + '';
  (form.elements.namedItem('n') as HTMLInputElement).value = options.n + '';
  (form.elements.namedItem('stream') as HTMLInputElement).checked = options.stream;

  const stopValue = options.stop.replace(/\n/g, "\\n");
  (form.elements.namedItem('stop') as HTMLInputElement).value = stopValue;
});

window.addEventListener('load', () => {
  loadStorage();
  const saveButton = document.getElementById('saveButton');
  if (saveButton) {
    saveButton.addEventListener('click', saveOptions);
  } else {
    console.error('Save button not found in the DOM');
  }
});

function saveOptions(): void {
    const form = document.getElementById('optionsForm') as HTMLFormElement;

    let stopValue = (form.elements.namedItem('stop') as HTMLInputElement).value;
    stopValue = stopValue.replace(/\\n/g, "\n");

    const options: Options = {
      model: (form.elements.namedItem('model') as HTMLSelectElement).value,
      max_tokens: parseInt((form.elements.namedItem('max_tokens') as HTMLInputElement).value, 10),
      temperature: parseFloat((form.elements.namedItem('temperature') as HTMLInputElement).value),
      top_p: parseFloat((form.elements.namedItem('top_p') as HTMLInputElement).value),
      n: parseInt((form.elements.namedItem('n') as HTMLInputElement).value, 10),
      stream: (form.elements.namedItem('stream') as HTMLInputElement).checked,
      stop: stopValue,
    };

    setStorageItem('options', options);
    setStorageItem('apiKey', (form.elements.namedItem('apiKey') as HTMLInputElement).value);
    console.log('Options saved to localStorage.');
    refreshData();
}

export { saveOptions };
