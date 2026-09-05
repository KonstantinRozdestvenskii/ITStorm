import { Injectable } from '@angular/core';
import {RequestPopupComponent} from "../components/order-popup/request-popup.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  private dialogRef: MatDialogRef<any> | null = null;

  constructor(private dialog: MatDialog,
              private router: Router) { }

  public openPopup(type: string) {
    this.dialogRef = this.dialog.open(RequestPopupComponent, {data: {type: type}});
    this.dialogRef.backdropClick()
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
}
