/**
 * Muestreo para gráficas: las series se reducen a un máximo razonable de
 * puntos tomando un elemento cada N (sin promediar ni alterar los valores
 * originales). La tabla siempre muestra los datos completos.
 */

export const MAX_CHART_POINTS = 120;

export function sampleSeries<T>(items: readonly T[], max: number): T[] {
  if (max <= 0) return [];
  if (items.length <= max) return [...items];

  const step = items.length / max;
  const result: T[] = [];
  for (let i = 0; i < max; i += 1) {
    const index = Math.min(items.length - 1, Math.floor(i * step));
    result.push(items[index] as T);
  }
  return result;
}