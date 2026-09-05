import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {LoginResponseType} from "../../../types/login-response.type";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {RequestTypeType} from "../../../types/request-type.type";

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient) { }

  sendRequest(name: string, phone: string, type: string, service: string | null = null): Observable<DefaultResponseType> {

    let body: {
      name: string,
      phone: string,
      service?: string,
      type: string
    } = {
      name: name,
      phone: phone,
      type: type
    }

    if (type === RequestTypeType.order && !!service) {
      body.service = service;
    }

    return this.http.post<DefaultResponseType>(environment.apiHost + 'requests', body);
  }
}
