import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RequestPopupComponent} from './components/order-popup/request-popup.component';
import {MatDialog} from "@angular/material/dialog";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    RequestPopupComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  exports: [
    RequestPopupComponent
  ]
})
export class SharedModule { }
