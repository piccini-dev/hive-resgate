/** Resolve URLs de assets públicos no subdiretório do GitHub Pages ou na raiz do Netlify.
 * A URL canônica do banco pode ser '/bee-spiral.png'; no Pages ela é
 * '/hive-resgate/bee-spiral.png'. Não altera URLs absolutas, data URLs nem
 * uma URL já prefixada.
 */
export function appPublicAssetUrl(asset: string, baseUrl: string): string {
  if (!asset.startsWith('/') || asset.startsWith('//')) return asset;
  const base = '/' + baseUrl.replace(/^\/+|\/+$/g, '') + '/';
  if (base === '//' || base === '/') return asset;
  return asset.startsWith(base) ? asset : base.slice(0, -1) + asset;
}
