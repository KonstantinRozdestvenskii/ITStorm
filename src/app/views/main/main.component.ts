import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OwlOptions, SlidesOutputData} from "ngx-owl-carousel-o";
import {MatDialogRef} from "@angular/material/dialog";
import {ActivatedRoute} from "@angular/router";
import {PopupService} from "../../shared/services/popup.service";
import {ServiceType} from "../../../types/service.type";
import {ArticleType} from "../../../types/article.type";
import {ArticleService} from "../../shared/services/article.service";
import {DefaultResponseType} from "../../../types/default-response.type";
import {ViewportScroller} from "@angular/common";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public offersCarouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    items: 1,
    nav: false
  };

  public reviewsCarouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 25,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: false
  };

  public activeIndex: number = 0;

  public slideIds: string[] = ['slide-1', 'slide-2', 'slide-3'];

  public services: ServiceType[] = [
    {
      image: 'service-1.png',
      title: 'Создание сайтов',
      description: 'В краткие сроки мы создадим качественный и самое главное продающий сайт для продвижения Вашего бизнеса!',
      price: 7500,
      value: 'website-creation'
    },
    {
      image: 'service-2.png',
      title: 'Продвижение',
      description: 'Вам нужен качественный SMM-специалист или грамотный таргетолог? Мы готовы оказать Вам услугу “Продвижения” на наивысшем уровне!',
      price: 3500,
      value: 'promotion'
    },
    {
      image: 'service-3.png',
      title: 'Реклама',
      description: 'Без рекламы не может обойтись ни один бизнес или специалист. Обращаясь к нам, мы гарантируем быстрый прирост клиентов за счёт правильно настроенной рекламы.',
      price: 1000,
      value: 'advertisement'
    },
    {
      image: 'service-4.png',
      title: 'Копирайтинг',
      description: 'Наши копирайтеры готовы написать Вам любые продающие текста, которые не только обеспечат рост охватов, но и помогут выйти на новый уровень в продажах.',
      price: 750,
      value: 'copywriting'
    }
  ];

  public advantages = [
    {
      mainText: 'Мастерски вовлекаем аудиторию в процесс.',
      description: 'Мы увеличиваем процент вовлечённости за короткий промежуток времени.'
    },
    {
      mainText: 'Разрабатываем бомбическую визуальную концепцию.',
      description: 'Наши специалисты знают как создать уникальный образ вашего проекта.'
    },
    {
      mainText: 'Создаём мощные воронки с помощью текстов.',
      description: 'Наши копирайтеры создают не только вкусные текста, но и классные воронки.'
    },
    {
      mainText: 'Помогаем продавать больше.',
      description: 'Мы не только помогаем разработать стратегию по продажам, но также корректируем её под нужды заказчика.'
    },
  ];

  public articles: ArticleType[] = [];

  // Обработчик события изменения слайда
  public onSlideChange(event: SlidesOutputData): void {
    // event.startPosition содержит корректный индекс активного слайда
    this.activeIndex = event.startPosition ?? 0;
  }

  @ViewChild('popup') popup!: TemplateRef<ElementRef>;
  private dialogRef: MatDialogRef<any> | null = null;

  private fragmentSubscription!: Subscription;

  constructor(private popupService: PopupService,
              private articleService: ArticleService,
              private activatedRoute: ActivatedRoute,
              private viewportScroller: ViewportScroller) {
  }

  ngOnInit(): void {

    this.articleService.getTopArticles()
      .subscribe((data: DefaultResponseType | ArticleType[]) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.articles = (data as ArticleType[]);
      })

  }

  ngAfterViewInit() {
    // Подписываемся на изменение фрагмента (якоря) в URL
    this.fragmentSubscription = this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment) {
        // Даем браузеру 100-200мс на завершение отрисовки DOM и применение стилей
        setTimeout(() => {
          this.viewportScroller.scrollToAnchor(fragment);
        }, 150); // 150мс обычно достаточно, можно увеличить до 300мс при медленной загрузке
      }
    });
  }

  ngOnDestroy() {
    // Обязательно отписываемся во избежание утечек памяти
    if (this.fragmentSubscription) {
      this.fragmentSubscription.unsubscribe();
    }
  }

  public openRequestPopup(type: string, service?: string) {

    this.popupService.openPopup(type, service);
  }

}
