import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AuthService} from "../../../core/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {filter, map, Subscription} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  public isLoggedIn: boolean = false;
  public userName: string = '';

  public activeFragment: string | null = null;
  public fragmentSubscription: Subscription | null = null;

  constructor(private authService: AuthService,
              private userService: UserService,
              private _snackbar: MatSnackBar,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.isLoggedIn = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {

    if (this.authService.getIsLoggedIn()) {
      this.isLoggedIn = true;
      this.loadUserInfo(); // Если да - сразу грузим имя
    }

    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;

      if (isLoggedIn) {
        this.loadUserInfo();
      } else {
        this.userName = ''; // Очищаем имя при выходе
      }
    });

    this.fragmentSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute.snapshot.fragment)
      )
      .subscribe(fragment => {
        this.activeFragment = fragment;
      });

    this.activeFragment = this.activatedRoute.snapshot.fragment;

  }

  // Выносим логику запроса в отдельный метод, чтобы не дублировать код
  private loadUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (data: DefaultResponseType | UserInfoType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          this.doLogout();
          return;
        }
        this.userName = (data as UserInfoType).name;
      },
      error: () => {
        this.doLogout();
      }
    });
  }

  public logout(): void {
    this.authService.logout()
      .subscribe({
        next: (data: DefaultResponseType) => {
          this.doLogout();
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.doLogout();
        }
      });
  }

  public doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackbar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.fragmentSubscription) {
      this.fragmentSubscription.unsubscribe();
    }
  }

}
