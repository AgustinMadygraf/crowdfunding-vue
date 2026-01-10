export type UpdateCategory = 'comercial' | 'tecnico' | 'logistica' | 'legal';

export type UpdateStatus = 'draft' | 'published';

export interface Update {
  id: number;
  category: UpdateCategory;
  title: string;
  content: string;
  status: UpdateStatus;
  publishedAt: string; // ISO 8601 date string
  excerpt?: string; // Short summary for card view
  imageUrl?: string; // Optional featured image
}
