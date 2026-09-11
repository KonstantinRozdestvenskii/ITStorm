import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RequestPopupComponent} from './components/order-popup/request-popup.component';
import {MatDialog} from "@angular/material/dialog";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import { ArticleCardComponent } from './components/article-card/article-card.component';
import {RouterModule} from "@angular/router";



@NgModule({
  declarations: [
    RequestPopupComponent,
    ArticleCardComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule
  ],
    exports: [
        RequestPopupComponent,
        ArticleCardComponent
    ]
})
export class SharedModule { }
