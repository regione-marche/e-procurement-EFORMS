import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SdkScrollToService {

    public scrollTo(element: HTMLElement, to: number, duration: number): void {
        let start: number = element.scrollTop;
        let change: number = to - start;
        let currentTime: number = 0;
        let increment: number = 20;

        let animateScroll = () => {
            currentTime += increment;
            let val = this.easeInOutQuad(currentTime, start, change, duration);
            element.scrollTop = val;
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    private easeInOutQuad(currentTime: number, startValue: number, change: number, duration: number) {
        currentTime /= duration / 2;
        if (currentTime < 1) return change / 2 * currentTime * currentTime + startValue;
        currentTime--;
        return -change / 2 * (currentTime * (currentTime - 2) - 1) + startValue;
    };
}