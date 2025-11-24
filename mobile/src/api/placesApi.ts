import { httpClient } from './httpClient';
import { Place } from '../types';

export const placesApi = {
  getAll: () => httpClient.get<Place[]>('/places'),
  getById: (id: string) => httpClient.get<any>(`/places/${id}`),
};
