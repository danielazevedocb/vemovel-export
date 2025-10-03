// export function getApiBaseUrl(): string {
//   const baseUrl =
//     process.env.VEMOVEL_API_URL ?? process.env.NEXT_PUBLIC_VEMOVEL_API_URL;

//   if (!baseUrl) {
//     throw new Error('Variável VEMOVEL_API_URL não configurada.');
//   }

//   return baseUrl.replace(/\/$/, '');
// }



export function getApiBaseUrl(): string {
  const isServer = typeof window === 'undefined';

  const baseUrl =
    (isServer
      ? process.env.API_URL_INTERNAL ?? process.env.VEMOVEL_API_URL
      : undefined) ??
    process.env.NEXT_PUBLIC_VEMOVEL_API_URL ??
      process.env.VEMOVEL_API_URL;

  if (!baseUrl) {
    throw new Error(
      'Variáveis de API não configuradas: defina NEXT_PUBLIC_VEMOVEL_API_URL (e opcional API_URL_INTERNAL ou VEMOVEL_API_URL).',
    );
  }

  const normalized = baseUrl.replace(/\/$/, '');
  if (normalized.toLowerCase().endsWith('/api')) {
    return normalized;
  }
  return `${normalized}/api`;
}
