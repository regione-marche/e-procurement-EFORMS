export class Captcha {

    protected form: HTMLElement;
    protected element: HTMLElement;
    protected errorElement: HTMLElement;
    protected isValid: boolean;

    constructor(element: HTMLElement, errorElement: HTMLElement) {
        this.element = element;
        this.errorElement = errorElement;
        this.form;
        this.isValid = false;

        this.initCaptcha();
    }

    protected initCaptcha(): void {
        this.initForm();
        this.stylizeElement();
        this.element.innerHTML = '';
        this.errorElement.style.display = 'none';
    }

    protected initForm(): void {
        if (this.element.parentElement.tagName === 'FORM') {
            this.form = this.element.parentElement;
            this.form.addEventListener('submit-captcha', this.handleSubmittingForm);
        } else {
            throw new Error('The parent of the captcha element must be a form element.');
        }
    }

    protected stylizeElement(): void {
        this.element.style.border = '1px solid #cccccc';
        this.element.style.width = '100px';
    }

    protected handleSubmittingForm = (event: Event): boolean => {
        event.preventDefault();
        this.checkValidity();
        if (this.isValid === true) {
            return true;
        } else {
            event.stopImmediatePropagation();
            return false;
        }
    }

    protected checkValidity(): void {
        if (this.isValid === true) {
            this.enteredValidValue();
        } else if (this.isValid === false) {
            this.enteredInvalidValue();
        }
    }

    protected enteredValidValue(): void {
        this.errorElement.style.display = 'none';
        this.element.style.border = '1px solid #00ff00';
        if (this.element.classList.contains('captcha_invalid')) {
            this.element.classList.remove('captcha_invalid');
        }
        if (!this.element.classList.contains('captcha_valid')) {
            this.element.classList.add('captcha_valid');
        }
    }

    protected enteredInvalidValue(): void {
        this.errorElement.style.display = 'block';
        this.element.style.border = '1px solid #ff0000';
        if (this.element.classList.contains('captcha_valid')) {
            this.element.classList.remove('captcha_valid');
        }
        if (!this.element.classList.contains('captcha_invalid')) {
            this.element.classList.add('captcha_invalid');
        }
    }

    protected resetClassNames(): void {
        if (this.element.classList.contains('captcha_valid')) {
            this.element.classList.remove('captcha_valid');
        }
        if (this.element.classList.contains('captcha_invalid')) {
            this.element.classList.remove('captcha_invalid');
        }
    }

    protected resetStyling(): void {
        this.element.style.border = '1px solid #000000';
    }
}