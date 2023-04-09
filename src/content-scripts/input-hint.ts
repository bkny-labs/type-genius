export class InputHint {
  private inputElement: HTMLInputElement = null;
  private hintElement: HTMLDivElement;

  addElements() {
    this.hintElement = document.createElement('div');
    document.body.appendChild(this.hintElement);
    this.hintElement.id = 'type-genius__input__hint';
    this.hintElement.style.display = 'none';

    // append the div to the document body or a specific element on the page
    document.body.appendChild(this.hintElement);
  }

  hide() {
    this.hintElement.style.display = 'none';
  }

  removeElements() {
    document.body.appendChild(this.hintElement);
    this.hintElement = null;
  }

  setHint(hint: string) {
    this.hintElement.textContent = hint;
  }

  setInput(inputElement: HTMLInputElement) {
    this.inputElement = inputElement;
  }

  show() {
    const boundingBox = this.inputElement.getBoundingClientRect();
    this.hintElement.style.display = 'block';
    this.hintElement.style.top = `${boundingBox.bottom + window.scrollY}px`;
    this.hintElement.style.left = `${boundingBox.left + window.scrollX}px`;
  }
}
