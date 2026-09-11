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
  selector: 'request-popup',
  templateUrl: './request-popup.component.html',
  styleUrls: ['./request-popup.component.scss']
})
export class RequestPopupComponent implements OnInit {

  public requestType = RequestTypeType;

  public requestForm: FormGroup = this.fb.group({
    service: [''],
    name: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.minLength(10)]]
  });

  isErrorShow: boolean = false;
  isSuccess: boolean = false;

  public services = [
    { value: 'website-creation', label: 'Создание сайтов' },
    { value: 'promotion', label: 'Продвижение' },
    { value: 'advertisement', label: 'Реклама' },
    { value: 'copywriting', label: 'Копирайтинг' }
  ];

  constructor(
    private dialogRef: MatDialogRef<RequestPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, service?: string },
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

    if (this.data.service) {
      this.requestForm.patchValue({ service: this.data.service });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  sendRequest(): void {
    if (this.requestForm.valid && this.requestForm.value.name && this.requestForm.value.phoneNumber) {
      const formValue = this.requestForm.value;

      const selectedService = this.services.find(s => s.value === formValue.service);
      const serviceLabel = selectedService ? selectedService.label : formValue.service;

      this.requestService.sendRequest(
        formValue.name,
        formValue.phoneNumber,
        this.data.type,
        serviceLabel
      ).subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error) {
            this.isErrorShow = true;
          } else {
            this.isSuccess = true;
          }
        },
        error: () => {
          this.isErrorShow = true;
        }
      });
    }
  }

}
