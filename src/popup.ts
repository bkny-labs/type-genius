import '../styles/popup.scss';
import { getStorageItem, setStorageItem } from './utils/storage';
import { refreshData } from './utils/refresh-data';

document.getElementById('go-to-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

const enableCheckbox = document.getElementById('toggle') as HTMLInputElement;
let keyCheck = false;

enableCheckbox.addEventListener('change', () => {
  if (keyCheck === true) {
    setStorageItem('typeGeniusEnabled', enableCheckbox.checked);
    refreshData();
    document.getElementById('alertMessage').style.display = undefined;
  } else {
    enableCheckbox.checked = false;
    document.getElementById('alertMessage').style.display = 'block';
  }
});

getStorageItem('apiKey').then((value) => {
  if (value) {
    keyCheck = true;
    getStorageItem('typeGeniusEnabled').then((value) => {
      enableCheckbox.checked = value;
    });
  } else {
    enableCheckbox.checked = false;
  }
});
