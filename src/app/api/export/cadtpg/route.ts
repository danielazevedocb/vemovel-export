import { NextResponse } from 'next/server';
import { buildCadTpgFile, PrazoRecord } from '@/lib/cadtpg';
import { getApiBaseUrl } from '@/lib/env';

export async function GET() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/prazo`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        { error: 'Falha ao buscar dados na API.', details: message },
        { status: response.status },
      );
    }

    const data = (await response.json()) as PrazoRecord[];
    const ordered = data
      .filter((item) => item && typeof item.ncond === 'number')
      .sort((a, b) => a.ncond - b.ncond);

    const content = buildCadTpgFile(ordered);

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="CADTPG.txt"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao gerar arquivo CADTPG.', details: String(error) },
      { status: 500 },
    );
  }
}
