import '../styles/popup.scss';
import { getStorageItem, setStorageItem } from './utils/storage';
import { refreshData } from './utils/refresh-data';

document.getElementById('go-to-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

const enableCheckbox = document.getElementById('toggle') as HTMLInputElement;

enableCheckbox.addEventListener('change', () => {
  setStorageItem('typeGeniusEnabled', enableCheckbox.checked);
  refreshData();
});

getStorageItem('typeGeniusEnabled').then((value) => {
  enableCheckbox.checked = value;
});
