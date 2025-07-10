import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdkLoaderComponent } from './components/sdk-loader/sdk-loader.component';

@NgModule({
  declarations: [
    SdkLoaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SdkLoaderComponent
  ]
})
export class SdkLoaderModule { }
