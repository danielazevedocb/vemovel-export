export function getApiBaseUrl(): string {
  const baseUrl =
    process.env.VEMOVEL_API_URL ?? process.env.NEXT_PUBLIC_VEMOVEL_API_URL;

  if (!baseUrl) {
    throw new Error('Variável VEMOVEL_API_URL não configurada.');
  }

  return baseUrl.replace(/\/$/, '');
}
