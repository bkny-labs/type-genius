import '../styles/popup.scss';
import { getStorageItem, setStorageItem } from './utils/storage';
import { refreshData } from './utils/refresh-data';

document.querySelector('.go-to-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

const enableCheckbox = document.getElementById('toggle') as HTMLInputElement;
let keyCheck = false;

enableCheckbox.addEventListener('change', () => {
  document.getElementById('alertMessage').style.display = 'none';
  document.getElementById('connectedMessage').style.display = 'none';
  if (keyCheck === true) {
    setStorageItem('typeGeniusEnabled', enableCheckbox.checked);
    refreshData();
    if (enableCheckbox.checked) {
      document.getElementById('connectedMessage').style.display = 'block';
    } else {
      document.getElementById('connectedMessage').style.display = 'none';
    }
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
