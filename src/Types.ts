export type Index = string[];

export type Notes = {
  index: Index;
  pages: Pages;
};

export type Page = {
  id: string;
  type: PageType;
  modified: Date;
  content: string;
};

export type Pages = Record<string, Page>;

export type PageType =
  | 'plain'
  | 'dotted'
  | 'grid'
  | 'lined';
