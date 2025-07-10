import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Directive({
    selector: 'p-dropdown',
})
export class DropdownDirective implements OnInit, OnDestroy {
    readonly KEY_DOWN_EVENT: string = 'keydown';
    readonly FOCUS_IN_EVENT: string = 'focusin';
    readonly TABINDEX_ATTRIBUTE: string = 'tabindex';
    readonly ROLE_ATTRIBUTE: string = 'role';
    readonly LIST_ITEM_SELECTOR: string = 'li';
    readonly ENTER_KEY_EVENT: string = 'Enter';
    readonly TAB_KEY_EVENT: string = 'Tab';

    private focusInSubscription: Subscription = new Subscription();
    private subscriptions: Subscription = new Subscription();
    private listElementSubscriptions: Array<Subscription> = new Array();
    private readonly dropdownHtmlElement: HTMLElement;

    constructor(private dropdown: Dropdown,
        private elementRef: ElementRef) {
        this.dropdownHtmlElement = this.elementRef.nativeElement as HTMLElement;
    }

    ngOnInit(): void {
        this.replaceKeyDownAction();
        this.subscribeToDropdownShowEvent();
        this.subscribeToDropdownHideEvent();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private subscribeToDropdownShowEvent() {
        this.subscriptions.add(
            this.dropdown.onShow.subscribe(() => {
                this.updateElementsList();
                this.subscribeToFocusInEvent();
            }),
        );
    }

    private subscribeToDropdownHideEvent() {
        this.subscriptions.add(
            this.dropdown.onHide.subscribe(() => {
                this.unsubscribeFromFocusInEvent();
                this.unsubscribeFromListElementsKeyDownEvents();
            }),
        );
    }

    private updateElementsList() {
        const listElements = this.dropdownHtmlElement.querySelectorAll<HTMLLIElement>(this.LIST_ITEM_SELECTOR);

        listElements.forEach((listElement: HTMLLIElement) => {
            this.subscribeToListElementKeyDownEvent(listElement);
            listElement.setAttribute(this.TABINDEX_ATTRIBUTE, '0');
            listElement.setAttribute(this.ROLE_ATTRIBUTE, 'listitem');
        });
    }

    private subscribeToListElementKeyDownEvent(listElement: HTMLLIElement) {
        this.listElementSubscriptions.push(
            fromEvent(listElement, this.KEY_DOWN_EVENT)
                .pipe(filter((event: KeyboardEvent) => event.key === this.ENTER_KEY_EVENT))
                .subscribe(() => {
                    // Simulation of mouse click of list element (trigger with (click) event in p-dropdownItem component which is child element of p-dropdown)
                    listElement.click();
                }),
        );
    }

    private unsubscribeFromListElementsKeyDownEvents() {
        this.listElementSubscriptions.forEach((singleSubscription: Subscription) => singleSubscription.unsubscribe());
        this.listElementSubscriptions = [];
    }

    private subscribeToFocusInEvent() {
        // Commentato perche' non si puo' piu' cliccare con il mouse nella scrollbar per scrollare gli elementi
        // this.focusInSubscription = fromEvent(document, this.FOCUS_IN_EVENT).subscribe(({ target }) => {
        //     // Situation when focus element is outside dropdown component
        //     if (!this.dropdownHtmlElement.contains(target as HTMLElement)) {
        //         this.dropdown.hide();
        //     }
        // });
    }

    private unsubscribeFromFocusInEvent() {
        if (this.focusInSubscription != null) {
            this.focusInSubscription.unsubscribe();
        }
    }

    /**
     * Overwrite default onKeydown method from PrimeNG dropdown component
     */
    private replaceKeyDownAction() {
        const onKeyDownOriginFn = this.dropdown.onKeyDown.bind(this.dropdown);

        this.dropdown.onKeyDown = (event: KeyboardEvent, search: boolean) => {
            if (event.key === this.TAB_KEY_EVENT) {
                // Sto scrivendo il comportamento della scheda predefinito definito nella classe del componente Dropdown dalla libreria PrimeNG (tradotto)
            } else {
                onKeyDownOriginFn(event, search);
            }
        }
    }
}