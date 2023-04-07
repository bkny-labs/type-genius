import '../styles/popup.scss';
import { getStorageItem, setStorageItem } from './storage';

document.getElementById('go-to-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

const enableCheckbox = document.getElementById('toggle') as HTMLInputElement;

const refreshData = () => {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {});
    });
  });
}

enableCheckbox.addEventListener('change', () => {
  setStorageItem('typeGeniusEnabled', enableCheckbox.checked);
  refreshData();
});

getStorageItem('typeGeniusEnabled').then((value) => {
  enableCheckbox.checked = value;
});
