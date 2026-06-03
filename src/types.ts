export type PageType =
  | 'plain'
  | 'dotted'
  | 'grid'
  | 'lined'
  | 'divider';

export type Page = {
  id: string;
  type: PageType;
  modified: Date;
  content: string;
};
