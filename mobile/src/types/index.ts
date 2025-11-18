export type PlaceType = 'CAFE' | 'RESTAURANT' | 'BAR' | 'CLUB' | 'OTHER';

export interface Tag {
  id: string;
  name: string;
  displayName?: string | null;
  category: string;
}

export interface PlaceTag {
  placeId: string;
  tagId: string;
  tag: Tag;
}

export interface PlaceStats {
  totalVisits: number;
  totalPlanned: number;
  totalReviews: number;
  avgRating?: number | null;
  trendingScore?: number | null;
}

export interface PlaceImage {
  id: string;
  url: string;
  isPrimary: boolean;
  source: string;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  description?: string | null;
  city: string;
  address?: string | null;
  priceLevel?: number | null;
  tags: PlaceTag[];
  stats?: PlaceStats | null;
  images: PlaceImage[];
}
