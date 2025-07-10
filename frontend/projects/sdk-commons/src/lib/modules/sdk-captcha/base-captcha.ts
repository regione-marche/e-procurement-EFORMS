import { Captcha } from './captcha';

export class BaseCaptcha extends Captcha {

    private canvas: any;
    private context: any;
    private code: any;
    private input: any;
    private enteredValue: any;
    private resetButton: any;

    constructor(element: HTMLElement, errorElement: HTMLElement) {
        super(element, errorElement);

        this.canvas;
        this.context;
        this.code;
        this.input;
        this.enteredValue;

        this.initBaseCaptcha();
    }

    private initBaseCaptcha(): void {
        this.generateCode();
        this.generateCanvas();
        this.writeCode();
        this.appendCanvas();
        this.generateInputElement();
        this.appendInputElement();
        this.addResetButton();

        this.resetButton.addEventListener('click', this.handleClickResetButton.bind(this));
    }

    private generateCanvas(): void {
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100px';
        this.canvas.style.height = '50px';
    }

    private appendCanvas(): void {
        this.element.appendChild(this.canvas);
    }

    private getContext(): void {
        this.context = this.canvas.getContext('2d');
    }

    private generateInputElement(): void {
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('class', 'captcha-base__input');
        input.style.display = 'block';
        this.input = input;
    }

    private appendInputElement(): void {
        if (this.element.nextSibling !== null) {
            this.form.insertBefore(this.input, this.element.nextSibling);
        } else {
            this.form.appendChild(this.input);
        }
    }

    private addResetButton(): void {
        const resetButton = document.createElement('button');
        resetButton.innerHTML = '&#8635;';
        resetButton.setAttribute('class', 'captcha-base__reset');
        resetButton.setAttribute('type', 'reset');
        this.form.insertBefore(resetButton, this.input);
        this.resetButton = resetButton;
    }

    private handleClickResetButton = (event: Event): void => {
        event.preventDefault();
        this.clearCanvas();
        this.generateCode();
        this.writeCode();
        this.input.value = '';
        this.resetStyling();
        this.resetClassNames();
    }

    private generateCode(): void {
        this.code = this.generateRandomNum(100000, 999999);
    }

    private writeCode(): void {
        this.getContext();
        this.context.font = '80px Arial';
        const codeString = this.code.toString();
        const textColor = void 0;
        for (let i = 0; i < 6; i++) {
            this.context.fillStyle = this.getRandomColor();
            this.transformContext(i);
            this.context.fillText(codeString[i], i * 52, 110);
            this.resetTransformation();
        }
    }

    private clearCanvas(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    override checkValidity(): void {
        const inputValue = parseInt(this.input.value);
        this.enteredValue = inputValue;

        if (this.enteredValue === this.code) {
            this.isValid = true;
        } else {
            this.isValid = false;
        }
        super.checkValidity();
    }

    override enteredValidValue(): void {
        super.enteredValidValue();
        if (this.input.classList.contains('captcha-base__input_invalid')) {
            this.input.classList.remove('captcha-base__input_invalid');
        }
        if (!this.input.classList.contains('captcha-base__input_valid')) {
            this.input.classList.add('captcha-base__input_valid');
        }
    }

    override enteredInvalidValue(): void {
        super.enteredInvalidValue();
        if (this.input.classList.contains('captcha-base__input_valid')) {
            this.input.classList.remove('captcha-base__input_valid');
        }
        if (!this.input.classList.contains('captcha-base__input_invalid')) {
            this.input.classList.add('captcha-base__input_invalid');
        }
    }

    override resetClassNames(): void {
        super.resetClassNames();
        if (this.input.classList.contains('captcha-base__input_valid')) {
            this.input.classList.remove('captcha-base__input_valid');
        }
        if (this.input.classList.contains('captcha-base__input_invalid')) {
            this.input.classList.remove('captcha-base__input_invalid');
        }
    }

    private generateRandomNum(min: number, max: number): number {
        var result = min - 0.5 + Math.random() * (max - min + 1); // NOSONAR
        return Math.round(result);
    }

    private getRandomColor(): any {
        let color = null;
        let randomNum = void 0;
        for (let i = 0; i < 3; i++) {
            randomNum = this.generateRandomNum(50, 230);
            color ? color = '#' + parseInt(randomNum, 16) : color += parseInt(randomNum, 16);
        }
        return color;
    }

    private getRadiansFromDegrees(degrees: number): number {
        return Math.PI / 180 * degrees;
    }

    private transformContext(index: number): void {
        let degrees = this.generateRandomNum(0, 13);
        if (index % 2 === 0) {
            degrees = -degrees;
        }
        const radians = this.getRadiansFromDegrees(degrees);
        this.context.rotate(radians);
    }

    private resetTransformation(): void {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

}