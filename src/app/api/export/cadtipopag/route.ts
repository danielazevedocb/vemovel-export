import { NextRequest, NextResponse } from 'next/server';
import { buildCadTipoPagFile, CadTipoPagRecord } from '@/lib/cadtipopag';
import { getApiBaseUrl } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const empresaIdParam = searchParams.get('empresaId');

    if (!empresaIdParam) {
      return NextResponse.json(
        { error: 'Informe o identificador da empresa (empresaId).' },
        { status: 400 },
      );
    }

    const empresaId = Number.parseInt(empresaIdParam, 10);
    if (Number.isNaN(empresaId) || empresaId <= 0) {
      return NextResponse.json(
        {
          error: 'Identificador da empresa inválido.',
          details: `Valor recebido: ${empresaIdParam}`,
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${getApiBaseUrl()}/empresas/${empresaId}/cadtipopag`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        { error: 'Falha ao buscar dados na API.', details: message },
        { status: response.status },
      );
    }

    const data = (await response.json()) as CadTipoPagRecord[];
    const ordered = data
      .filter((item) => item && typeof item.codigo === 'number')
      .sort((a, b) => a.codigo - b.codigo);

    const content = buildCadTipoPagFile(ordered);

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="CADTIPOPAG.txt"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao gerar arquivo CADTIPOPAG.', details: String(error) },
      { status: 500 },
    );
  }
}
