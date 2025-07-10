import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { SdkMenuConfig, SdkMenuItem, SdkMenuOutput } from '@maggioli/sdk-controls';
import { cloneDeep, isObject } from 'lodash-es';
import { Observable, of, Subscription } from 'rxjs';

export interface SdkResponsiveMenuSidebarConfig {
    menu: SdkMenuConfig;
    bottomMenu: SdkMenuConfig;
}

@Component({
    templateUrl: `sdk-responsive-menu-sidebar.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkResponsiveMenuSidebarWidget implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-responsive-menu-sidebar`;
    @Output('output') public output$ = new EventEmitter();
    public config: SdkResponsiveMenuSidebarConfig;
    private subscription: Subscription;

    public menuObs: Observable<SdkMenuConfig>;
    public bottomMenuObs: Observable<SdkMenuConfig>;

    /**
     * Observable con la configurazione
     */
    @Input('config') public config$: Observable<SdkResponsiveMenuSidebarConfig>;

    public ngOnInit(): void {
        this.subscription = this.config$.subscribe((config: SdkResponsiveMenuSidebarConfig) => {
            if (isObject(config)) {
                this.config = cloneDeep(config);
                this.config.menu.vertical = true;
                this.config.bottomMenu.vertical = true;
                this.menuObs = of(this.config.menu);
                this.bottomMenuObs = of(this.config.bottomMenu);
            }
        });
    }

    public ngOnDestroy(): void {
        if (isObject(this.subscription)) {
            this.subscription.unsubscribe();
        }
    }

    public manageMenuClick(menuOutput: SdkMenuOutput): void {
        if (isObject(menuOutput) && isObject(menuOutput.item)) {
            let item: SdkMenuItem = menuOutput.item;

            this.output$.emit(item);
        }
    }
}