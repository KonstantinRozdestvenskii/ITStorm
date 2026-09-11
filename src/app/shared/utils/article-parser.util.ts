import {ArticleType} from "../../../types/article.type";

export class ArticleParser {
  /**
   * Парсит HTML-текст статьи, удаляя дублирующиеся заголовок и описание,
   * и разделяет контент на превью и логические блоки (items) по тегам <h3>.
   */
  public static parse(article: ArticleType): { preview: string; items: string[] } {
    if (!article.text) {
      return { preview: '', items: [] };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(article.text, 'text/html');
    const body = doc.body;

    // Вспомогательная функция для нормализации текста:
    // заменяет все множественные пробелы и переносы строк на один пробел и удаляет края.
    const normalizeText = (text: string | null | undefined): string => {
      return text ? String(text).replace(/\s+/g, ' ').trim() : '';
    };

    const normalizedTitle = normalizeText(article.title);
    const normalizedDescription = normalizeText(article.description);

    // 1. Удаляем <h1>, если его нормализованный текст совпадает с нормализованным title
    const h1Element = body.querySelector('h1');
    if (h1Element && normalizeText(h1Element.textContent) === normalizedTitle) {
      h1Element.remove();
    }

    // 2. Удаляем <p>, если его нормализованный текст совпадает с нормализованным description
    // Проверяем только дочерние элементы первого уровня
    const topChildren = Array.from(body.children);
    for (const child of topChildren) {
      if (
        child.tagName.toLowerCase() === 'p' &&
        normalizeText(child.textContent) === normalizedDescription
      ) {
        child.remove();
      }
    }

    // 3. Разделяем оставшийся контент на preview и items
    let previewNodes: ChildNode[] = [];
    let items: string[] = [];
    let currentItemNodes: ChildNode[] = [];
    let hasFoundFirstH3 = false;

    Array.from(body.childNodes).forEach((node) => {
      const isH3 = node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === 'h3';

      if (isH3) {
        if (!hasFoundFirstH3) {
          hasFoundFirstH3 = true;
          currentItemNodes.push(node);
        } else {
          // Сохраняем предыдущий блок и начинаем новый
          if (currentItemNodes.length > 0) {
            items.push(this.nodesToHtml(currentItemNodes));
          }
          currentItemNodes = [node];
        }
      } else {
        if (!hasFoundFirstH3) {
          previewNodes.push(node);
        } else {
          currentItemNodes.push(node);
        }
      }
    });

    // Добавляем последний собранный item
    if (currentItemNodes.length > 0) {
      items.push(this.nodesToHtml(currentItemNodes));
    }

    return {
      preview: this.nodesToHtml(previewNodes),
      items: items,
    };
  }

  /**
   * Вспомогательный метод для преобразования массива DOM-узлов обратно в HTML-строку
   */
  private static nodesToHtml(nodes: ChildNode[]): string {
    const div = document.createElement('div');
    nodes.forEach((node) => {
      div.appendChild(node.cloneNode(true));
    });
    return div.innerHTML;
  }
}
