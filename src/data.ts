export interface Item { id: string; name: string; category: string; region: string }
const names = ['Atlas', 'Juniper', 'Orbit', 'Cedar', 'Nova', 'Willow', 'Echo', 'Sage'];
const categories = ['Interface', 'Platform', 'Analytics', 'Infrastructure'];
const regions = ['Amsterdam', 'Tokyo', 'San Francisco', 'London', 'Berlin'];

export const rows: Item[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: `R-${String(i + 1).padStart(5, '0')}`,
  name: `${names[i % names.length]} ${String(i + 1).padStart(4, '0')}`,
  category: categories[Math.floor(i / names.length) % categories.length],
  region: regions[i % regions.length],
}));
export const searchItems = rows.slice(0, 2_000);
export function filterItems(items: Item[], query: string): Item[] {
  const term = query.trim().toLowerCase();
  return items.filter(item => `${item.id} ${item.name} ${item.category} ${item.region}`.toLowerCase().includes(term));
}
