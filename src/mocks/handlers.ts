import { http, HttpResponse, delay } from 'msw';
import { MOCK_PARTS } from './data/parts';
import { PartCategory } from '../app/core/models/part.model';

export const handlers = [
  http.get('/api/parts', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const category = url.searchParams.get('category') as PartCategory | null;
    const brand = url.searchParams.get('brand');
    const q = url.searchParams.get('q')?.toLowerCase();
    const maxPrice = url.searchParams.get('maxPrice');

    let results = [...MOCK_PARTS];

    if (category) {
      results = results.filter((p) => p.category === category);
    }
    if (brand) {
      results = results.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (q) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          Object.values(p.specs).some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) {
        results = results.filter((p) => p.price <= max);
      }
    }

    return HttpResponse.json({
      items: results,
      total: results.length,
    });
  }),

  http.get('/api/parts/:id', async ({ params }) => {
    await delay(100);
    const part = MOCK_PARTS.find((p) => p.id === params['id']);
    if (!part) {
      return HttpResponse.json({ message: 'Part not found' }, { status: 404 });
    }
    return HttpResponse.json(part);
  }),

  http.get('/api/categories', async () => {
    await delay(50);
    const counts = MOCK_PARTS.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {});
    return HttpResponse.json({ counts });
  }),
];
