import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {UserInfoType} from "../../../types/user-info.type";
import {environment} from "../../../environments/environment";
import {ArticleType} from "../../../types/article.type";
import {CategoryType} from "../../../types/category.type";
import {ArticlesResponseType} from "../../../types/articleResponseType";
import {ArticlesActiveParamsType} from "../../../types/articles-active-params.type";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(private http: HttpClient) { }

  public getCategories(): Observable<DefaultResponseType | CategoryType[]> {
    return this.http.get<DefaultResponseType | CategoryType[]>(environment.apiHost + 'categories');
  }

  public getTopArticles(): Observable<DefaultResponseType | ArticleType[]> {
    return this.http.get<DefaultResponseType | ArticleType[]>(environment.apiHost + 'articles/top');
  }

  public getArticles(params: ArticlesActiveParamsType): Observable<DefaultResponseType | ArticlesResponseType> {
    return this.http.get<DefaultResponseType | ArticlesResponseType>(environment.apiHost + 'articles', {
      params: params
    });
  }

  public getArticle(url: string): Observable<DefaultResponseType | ArticleType> {
    return this.http.get<DefaultResponseType | ArticleType>(environment.apiHost + 'articles/' + url);
  }

  public getRelatedArticles(url: string): Observable<DefaultResponseType | ArticleType[]> {
    return this.http.get<DefaultResponseType | ArticleType[]>(environment.apiHost + 'articles/related/' + url);
  }
}
