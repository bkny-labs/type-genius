import '../styles/contentScript.scss';

import { TypeGenius } from './content-scripts/type-genius';
import { getStorageData } from './utils/storage';

const typeGenius = new TypeGenius();


const loadStorage = () => getStorageData().then(data => {
  console.log('refresh', data);
  typeGenius.setEnabled(data.typeGeniusEnabled);
  typeGenius.setOptions(data.options);
  if (data.apiKey) {
    typeGenius.setApiKey(data.apiKey);
  }
});

chrome.runtime.onMessage.addListener(() => loadStorage());
loadStorage();
