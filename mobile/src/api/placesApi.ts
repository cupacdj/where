import { httpClient } from './httpClient';
import { Place } from '../types';

export const placesApi = {
  getAll: () => httpClient.get<Place[]>('/places'),
  getById: (id: string) => httpClient.get<any>(`/places/${id}`),
  search: (params: { q?: string; tags?: string[]; type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.type) searchParams.append('type', params.type);
    if (params.tags && params.tags.length) {
      // backend accepts tags as comma-separated
      searchParams.append('tags', params.tags.join(','));
    }
    const qs = searchParams.toString();
    const path = qs ? `/places/search?${qs}` : '/places/search';
    return httpClient.get<Place[]>(path);
  },
  getTags: () => httpClient.get<Array<{ id: string; name: string; displayName?: string; category: string }>>('/places/tags'),
};
