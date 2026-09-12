import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RequestPopupComponent} from './components/order-popup/request-popup.component';
import {MatDialog} from "@angular/material/dialog";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import { ArticleCardComponent } from './components/article-card/article-card.component';
import {RouterModule} from "@angular/router";
import {NgxMaskModule} from "ngx-mask";
import { PolicyComponent } from '../views/user/policy/policy.component';
import { LoaderComponent } from './components/loader/loader.component';



@NgModule({
  declarations: [
    RequestPopupComponent,
    ArticleCardComponent,
    LoaderComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgxMaskModule.forRoot(),
    RouterModule
  ],
  exports: [
    RequestPopupComponent,
    ArticleCardComponent,
    LoaderComponent
  ]
})
export class SharedModule { }
