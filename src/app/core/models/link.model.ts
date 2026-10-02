export interface Link {
  id: number;
  title: string;
  url: string;
  description?: string;
  image?: string;
  platform?: string;
  order: number;
  clicks: number;
}
