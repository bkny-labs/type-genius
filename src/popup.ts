import '../styles/popup.scss';
import { getStorageItem, setStorageItem } from './storage';

document.getElementById('go-to-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

const enableCheckbox = document.getElementById('toggle') as HTMLInputElement;

const enableTypeGenius = (enabled: boolean) => {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { typeGeniusEnabled: enabled });
    });
  });
}

enableCheckbox.addEventListener('change', () => {
  enableTypeGenius(enableCheckbox.checked);
  setStorageItem('enabled', enableCheckbox.checked);
});

getStorageItem('enabled').then((value) => {
  enableCheckbox.checked = value;
  enableTypeGenius(value);
});
