import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

export interface EmpresaRecord {
  id: number;
  nome: string;
  cnpj?: string | null;
}

export async function GET() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/empresas`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        { error: 'Falha ao buscar empresas na API.', details: message },
        { status: response.status },
      );
    }

    const data = (await response.json()) as EmpresaRecord[];
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Resposta inválida ao buscar empresas.' },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao carregar empresas.', details: String(error) },
      { status: 500 },
    );
  }
}
