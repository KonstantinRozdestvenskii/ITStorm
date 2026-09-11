import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";import {Observable} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {ArticlesResponseType} from "../../../types/articleResponseType";
import {environment} from "../../../environments/environment";
import {CommentsActiveParamsType} from "../../../types/comments-active-params.type";
import {CommentsResponseType} from "../../../types/comments-response.type";
import {ActionType} from "../../../types/action.type";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) { }

  public getComments(article: string, offset: number): Observable<DefaultResponseType | CommentsResponseType> {
    return this.http.get<DefaultResponseType | CommentsResponseType>(environment.apiHost + 'comments', {
      params: {
        offset: offset,
        article: article,
      }
    });
  }

  public createComments(article: string, text: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.apiHost + 'comments', {
      text,
      article
    });
  }


  public getUserActionsForArticle(articleId: string): Observable<DefaultResponseType | ActionType[]> {
    return this.http.get<DefaultResponseType | ActionType[]>(environment.apiHost + 'comments/article-comment-actions', {
      params: {
        articleId: articleId
      }
    });
  }

  public applyAction(comment: string, action: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.apiHost + 'comments/' + comment + '/apply-action', {
      action
    });
  }
}
