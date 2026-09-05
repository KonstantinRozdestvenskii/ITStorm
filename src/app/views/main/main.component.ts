import { Component, OnInit } from '@angular/core';
import {OwlOptions, SlidesOutputData} from "ngx-owl-carousel-o";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public customOptions: OwlOptions = {
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

  public activeIndex: number = 0;

  public slideIds: string[] = ['slide-1', 'slide-2', 'slide-3'];

  // Обработчик события изменения слайда
  public onSlideChange(event: SlidesOutputData): void {
    // event.startPosition содержит корректный индекс активного слайда
    this.activeIndex = event.startPosition ?? 0;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
