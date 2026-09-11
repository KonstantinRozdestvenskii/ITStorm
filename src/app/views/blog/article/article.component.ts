import {Component, OnInit} from '@angular/core';
import {ArticleService} from "../../../shared/services/article.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ArticleType} from "../../../../types/article.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ArticleParser} from "../../../shared/utils/article-parser.util";
import {AuthService} from "../../../core/auth.service";
import {CommentsService} from "../../../shared/services/comments.service";
import {CommentsResponseType} from "../../../../types/comments-response.type";
import {CommentType} from "../../../../types/comment.type";
import {ActionType} from "../../../../types/action.type";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  public article: ArticleType;
  public relatedArticles: ArticleType[] = [];
  public articleTextItems: string[] = [];
  public articleTextPreview: string = '';
  public isLoggedIn: boolean = false;

  public comments: CommentType[] = [];
  public isAddCommentsShow = false;

  private commentsOffset: number = 0;

  public commentsForm: FormGroup = this.fb.group({
    commentText: ['', Validators.required],
  })

  constructor(private articleService: ArticleService,
              private commentService: CommentsService,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private router: Router,
              private _snackbar: MatSnackBar,
              private fb: FormBuilder) {

    this.article = {id: '', title: '', description: '', image: '', date: '', category: '', url: ''};
    this.isLoggedIn = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
    });

    this.activatedRoute.params.subscribe(params => {
      const url = params['url'];
      if (url) {
        this.articleService.getArticle(url)
          .subscribe((data: DefaultResponseType | ArticleType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            this.article = (data as ArticleType);
            this.parseArticleText();

            this.comments = [];
            this.commentsOffset = 0;
            this.isAddCommentsShow = false;

            this.loadComments();

            this.articleService.getRelatedArticles(url)
              .subscribe((data: DefaultResponseType | ArticleType[]) => {
                if ((data as DefaultResponseType).error !== undefined) {
                  throw new Error((data as DefaultResponseType).message);
                }
                this.relatedArticles = (data as ArticleType[]);
              });
          });
      }
    });
  }

  private loadComments(): void {
    if (this.article.commentsCount && this.article.commentsCount > 0) {
      this.commentService.getComments(this.article.id, this.commentsOffset)
        .subscribe({
          next: (data: DefaultResponseType | CommentsResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            const commentsResponse = data as CommentsResponseType;
            const limit = this.comments.length === 0 ? 3 : 10;
            const newComments = commentsResponse.comments.slice(0, limit);

            if (this.isLoggedIn) {
              this.commentService.getUserActionsForArticle(this.article.id)
                .subscribe({
                  next: (actionsData: DefaultResponseType | ActionType[]) => {
                    if ((actionsData as DefaultResponseType).error !== undefined) {
                      throw new Error((actionsData as DefaultResponseType).message);
                    }

                    const actions = actionsData as ActionType[];
                    const enrichedComments = newComments.map(comment => {
                      const action = actions.find(a => a.comment === comment.id);
                      return {
                        ...comment,
                        isLiked: action ? action.action === 'like' : false,
                        isDisliked: action ? action.action === 'dislike' : false
                      };
                    });

                    this.comments.push(...enrichedComments);
                    this.commentsOffset = this.comments.length;
                    this.isAddCommentsShow = (this.article.commentsCount ?? 0) > this.comments.length;
                  },
                  error: () => {
                    this._snackbar.open('Ошибка загрузки действий пользователя');
                  }
                });
            } else {
              const enrichedComments = newComments.map(comment => ({
                ...comment,
                isLiked: false,
                isDisliked: false
              }));

              this.comments.push(...enrichedComments);
              this.commentsOffset = this.comments.length;
              this.isAddCommentsShow = (this.article.commentsCount ?? 0) > this.comments.length;
            }
          },
          error: () => {
            this._snackbar.open('Ошибка загрузки комментариев');
          }
        });
    }
  }

  private parseArticleText(): void {
    const articleTextParsed: { preview: string, items: string[] } = ArticleParser.parse(this.article);
    this.articleTextPreview = articleTextParsed.preview;
    this.articleTextItems = articleTextParsed.items;
  }

  public addComments(): void {
    this.loadComments();
  }

  public createNewComment(): void {
    if (this.commentsForm.valid && this.commentsForm.value.commentText) {
      this.commentService.createComments(this.article.id, this.commentsForm.value.commentText)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error && data.message) {
              this._snackbar.open(data.message);
              throw new Error(data.message);
            }

            this._snackbar.open('Комментарий добавлен');
            this.commentsForm.reset();
            this.comments = [];
            this.commentsOffset = 0;
            this.article.commentsCount = (this.article.commentsCount ?? 0) + 1;
            this.loadComments();
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackbar.open(errorResponse.error.message);
            } else {
              this._snackbar.open('Ошибка добавления комментария');
            }
          }
        })
    } else {
      this._snackbar.open('Введите текст комментария');
    }
  }

  public likeComment(comment: CommentType): void {
    if (!this.isLoggedIn) {
      this._snackbar.open('Необходима авторизация');
      return;
    }

    comment.isLiked = !comment.isLiked;

    if (comment.isLiked && comment.isDisliked) {
      comment.isDisliked = false;
    }

    if (comment.isLiked) {
      comment.likesCount = (comment.likesCount ?? 0) + 1;
      if (comment.dislikesCount && comment.dislikesCount > 0) {
        comment.dislikesCount -= 1;
      }
    } else {
      if (comment.likesCount && comment.likesCount > 0) {
        comment.likesCount -= 1;
      }
    }

    this.commentService.applyAction(comment.id, 'like')
      .subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error && data.message) {
            this._snackbar.open(data.message);
            throw new Error(data.message);
          }

          this._snackbar.open('Ваш голос учтен');
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackbar.open(errorResponse.error.message);
          } else {
            this._snackbar.open('Ошибка сохранения реакции');
          }
        }
      });
  }

  public dislikeComment(comment: CommentType): void {
    if (!this.isLoggedIn) {
      this._snackbar.open('Необходима авторизация');
      return;
    }

    comment.isDisliked = !comment.isDisliked;

    if (comment.isDisliked && comment.isLiked) {
      comment.isLiked = false;
    }

    if (comment.isDisliked) {
      comment.dislikesCount = (comment.dislikesCount ?? 0) + 1;
      if (comment.likesCount && comment.likesCount > 0) {
        comment.likesCount -= 1;
      }
    } else {
      if (comment.dislikesCount && comment.dislikesCount > 0) {
        comment.dislikesCount -= 1;
      }
    }

    this.commentService.applyAction(comment.id, 'dislike')
      .subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error && data.message) {
            this._snackbar.open(data.message);
            throw new Error(data.message);
          }

          this._snackbar.open('Ваш голос учтен');
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackbar.open(errorResponse.error.message);
          } else {
            this._snackbar.open('Ошибка сохранения реакции');
          }
        }
      });
  }

  public violateComment(comment: CommentType): void {
    if (!this.isLoggedIn) {
      this._snackbar.open('Необходима авторизация');
      return;
    }

    this.commentService.applyAction(comment.id, 'violate')
      .subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error && data.message) {
            this._snackbar.open(data.message);
            throw new Error(data.message);
          }

          this._snackbar.open('Жалоба отправлена');
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackbar.open(errorResponse.error.message);
          } else {
            this._snackbar.open('Ошибка отправки жалобы');
          }
        }
      });
  }
}
