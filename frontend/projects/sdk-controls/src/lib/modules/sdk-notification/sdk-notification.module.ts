import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { SdkNotificationService } from './services/sdk-notification.service';

@NgModule({
  imports: [
    CommonModule,
    ToastrModule.forRoot()
  ],
  providers: [
    SdkNotificationService
  ]
})
export class SdkNotificationModule { }
