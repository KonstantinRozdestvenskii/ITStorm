import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {RequestTypeType} from "../../../../types/request-type.type";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {RequestService} from "../../services/request.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-request-popup',
  templateUrl: './request-popup.component.html',
  styleUrls: ['./request-popup.component.scss']
})
export class RequestPopupComponent implements OnInit {

  public requestType = RequestTypeType;

  public requestForm: FormGroup = this.fb.group({
    service: [''],
    name: ['', Validators.required],
    phoneNumber: ['', Validators.required]
  });

  isErrorShow: boolean = false;
  isSuccess: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<RequestPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string },
    private fb: FormBuilder,
    private requestService: RequestService) {
    if (data.type === RequestTypeType.order) {
      this.requestForm.get('service')?.setValidators([Validators.required]);
    }
    this.isErrorShow = false;
    this.isSuccess = false;
  }

  ngOnInit(): void {
    if (this.data.type === RequestTypeType.order) {
      this.requestForm.get('service')?.setValidators([Validators.required]);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  sendRequest(): void {
    if (this.requestForm.valid && this.requestForm.value.name && this.requestForm.value.phoneNumber) {
      this.requestService.sendRequest(this.requestForm.value.name,
        this.requestForm.value.phoneNumber, this.data.type, this.requestForm.value.service).subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error) {
            this.isErrorShow = true;
          }

          this.isSuccess = true;
        },
        error: () => {
          this.isErrorShow = true;
        }
      });
    }
  }

}
