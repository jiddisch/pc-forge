import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Part, PartCategory } from '../models/part.model';

export interface PartsQuery {
  category?: PartCategory | null;
  brand?: string | null;
  q?: string | null;
  maxPrice?: number | null;
}

export interface PartsResponse {
  items: Part[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class PartsService {
  private readonly http = inject(HttpClient);

  getParts(query: PartsQuery = {}): Observable<PartsResponse> {
    let params = new HttpParams();
    if (query.category) params = params.set('category', query.category);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.q) params = params.set('q', query.q);
    if (query.maxPrice != null && query.maxPrice > 0) {
      params = params.set('maxPrice', String(query.maxPrice));
    }
    return this.http.get<PartsResponse>('/api/parts', { params });
  }

  getPart(id: string): Observable<Part> {
    return this.http.get<Part>(`/api/parts/${id}`);
  }
}
