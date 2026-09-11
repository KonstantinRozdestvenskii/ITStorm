import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
import * as querystring from "node:querystring";
import {FilterType} from "../../../../types/filter.type";
import {ArticleType} from "../../../../types/article.type";
import {ArticlesActiveParamsType} from "../../../../types/articles-active-params.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ArticleService} from "../../../shared/services/article.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {CategoryType} from "../../../../types/category.type";
import {ArticlesResponseType} from "../../../../types/articleResponseType";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  public appliedFilters: {
    name: string;
    dataUrl: string;
  }[] = [];

  public filters: FilterType[] = [];
  public isFiltersOpen: boolean = false;

  public articles: ArticleType[] = [];

  public activeParams: ArticlesActiveParamsType = {categories: []};

  public pages: number[] = [];

  constructor(private articleService: ArticleService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {

    this.articleService.getCategories().subscribe((data: DefaultResponseType | CategoryType[]) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }

      (data as CategoryType[]).forEach((category: CategoryType) => {
        const filter: FilterType = {
          name: category.name,
          url: category.url,
          isActive: false
        }

        this.filters.push(filter);
      });

      this.activatedRoute.queryParams.subscribe((params) => {
        if (params.hasOwnProperty("categories")) {
          this.activeParams.categories = Array.isArray(params['categories']) ? params['categories'] : [params['categories']];
          this.filters.map(filter => {
            const existFilter = this.activeParams.categories.find(item => item === filter.url);
            filter.isActive = !!existFilter;
            return filter;
          });
          this.isFiltersOpen = true;
        } else {
          this.isFiltersOpen = false;
        }
        if (params.hasOwnProperty("page")) {
          this.activeParams.page = +params['page'];
        }

        this.appliedFilters = [];
        this.activeParams.categories.forEach(category => {
          const foundFilterIndex = this.filters.findIndex(item => item.url === category);
          if (foundFilterIndex > -1) {
            this.filters[foundFilterIndex].isActive = true;
            this.appliedFilters.push({
              name: this.filters[foundFilterIndex].name,
              dataUrl: this.filters[foundFilterIndex].url
            })
          }
        });

        this.articleService.getArticles(this.activeParams)
          .subscribe((data: DefaultResponseType | ArticlesResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            const articlesResponse = data as ArticlesResponseType;

            this.pages = [];

            for (let i = 1; i <= articlesResponse.pages; i++) {
              this.pages.push(i);
            }

            this.articles = articlesResponse.items;
          })
      });
    });
  }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    const target = event.target as HTMLElement;
    if (this.isFiltersOpen && !target.closest('.blog-filters')) {
      this.isFiltersOpen = false;
    }
  }

  public toogleSorting(): void {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  public removeAppliedFilter(appliedFilter: { name: string, dataUrl: string }): void {
    this.activeParams.categories = this.activeParams.categories.filter(item => item !== appliedFilter.dataUrl);

    this.activeParams.page = 1;
    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

  public openPage(page: number): void {
    this.activeParams.page = page;

    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

  public openPrevPage(): void {

    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
    }

    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

  public openNextPage(): void {

    if (this.activeParams.page) {
      if (this.activeParams.page < this.pages.length) {
        this.activeParams.page++;
      }
    } else {
      this.activeParams.page = 1;
    }

    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

  public selectFilter(filter: FilterType) {
    if (this.activeParams.categories && this.activeParams.categories.length > 0) {
      const existingTypeInParams = this.activeParams.categories.find(item => item === filter.url);
      if (existingTypeInParams && filter.isActive) {
        this.activeParams.categories = this.activeParams.categories.filter(item => item != filter.url);
      } else if (!existingTypeInParams && !filter.isActive) {
        this.activeParams.categories = [...this.activeParams.categories, filter.url];
      }
    } else if (!filter.isActive) {
      this.activeParams.categories = [filter.url];
    }

    this.activeParams.page = 1;

    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

}
