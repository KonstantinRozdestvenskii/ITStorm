import {ArticleType} from "./article.type";

export type ArticlesResponseType = {
  count: number;
  pages: number;
  items: ArticleType[];
}
