export class TextareaHint {
  private inputElement: HTMLTextAreaElement = null;
  private hintElement: HTMLDivElement;
  private hintInput: HTMLSpanElement;
  private hintText: HTMLSpanElement;
  private resizeObserver: ResizeObserver;
  private copyStylesHandler: () => void;
  private scrollHandler: () => void;
  private inputHandler: () => void;

  addElements() {
    // create the div element with id="type-genius__hint"
    this.hintElement = document.createElement("div");
    this.hintElement.id = "type-genius__hint";

    // create the first span element with id="type-genius__hint-input" and append it to the div
    this.hintInput = document.createElement("span");
    this.hintInput.id = "type-genius__hint-input";
    this.hintElement.appendChild(this.hintInput);

    // create the second span element with id="type-genius__hint-text" and append it to the div
    this.hintText = document.createElement("span");
    this.hintText.id = "type-genius__hint-text";
    this.hintElement.appendChild(this.hintText);

    // append the div to the document body or a specific element on the page
    document.body.appendChild(this.hintElement);
  }

  addListeners() {
    this.copyStylesHandler = this.copyStyles.bind(this);
    window.addEventListener('resize', this.copyStylesHandler);
    this.resizeObserver = new ResizeObserver(this.copyStylesHandler);
    this.resizeObserver.observe(this.inputElement);

    this.scrollHandler = () => {
      // Set the scroll position of the hint to be the same as the textarea
      this.hintElement.scrollTop = this.inputElement.scrollTop;
      this.hintElement.scrollLeft = this.inputElement.scrollLeft;
    };
    this.inputElement.addEventListener('scroll', this.scrollHandler);

    // Update hint on input change
    this.inputHandler = () => {
      this.hintInput.innerText = this.inputElement.value;
      if (this.inputElement.value.includes('\n') === true) {
        this.hintText.style.display = 'block';
      } else {
        this.hintText.style.display = 'inline-block';
      }
    }
    this.inputElement.addEventListener('input', this.inputHandler);
  }

  copyStyles() {
    console.log('copy styles');
    const styleProps = [
      'fontSize',
      'fontFamily',
      'fontWeight',
      'lineHeight',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'width',
      'height',
      'border',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft'
    ];

    styleProps.forEach((prop) => {
      this.hintElement.style[prop] = window.getComputedStyle(this.inputElement)[prop];
    });

    this.hintElement.style.position = 'absolute';
    this.hintElement.style.display = 'inline-block';
    // Calculate top and left position of hint
    const inputRect = this.inputElement.getBoundingClientRect();
    this.hintElement.style.top = inputRect.top + window.scrollY + 'px';
    this.hintElement.style.left = inputRect.left + window.scrollX + 'px';
    this.hintElement.style.pointerEvents = 'none';
  }

  hide() {
    console.log('hide');
    this.hintElement.style.display = 'none';
    this.removeListeners();
  }

  removeElements() {
    document.body.appendChild(this.hintElement);
    this.hintElement = null;
  }

  removeListeners() {
    console.log('remove listener');
    window.removeEventListener('resize', this.copyStylesHandler);
    if (this.inputElement !== null) {
      this.inputElement.removeEventListener('scroll', this.scrollHandler);
      this.inputElement.removeEventListener('input', this.inputHandler);
      this.resizeObserver.unobserve(this.inputElement);
    }
  }

  setHint(hint: string) {
    this.hintText.textContent = hint;
  }

  setInput(inputElement: HTMLTextAreaElement) {
    this.inputElement = inputElement;
  }

  show() {
    console.log('show');
    this.hintElement.style.display = 'inline';
    this.addListeners();
    this.copyStyles();
    this.inputHandler();
  }
}

