export interface PrazoRecord {
  ncond: number;
  condicao: string;
  acrescimo?: number | null;
  desconto?: number | null;
  prazoMedio?: number | null;
  valorMinimo?: number | null;
  usaCaixa?: string | null;
  modosPagto?: string | null;
  diasVencto1?: number | null;
  diasVencto2?: number | null;
  diasVencto3?: number | null;
  diasVencto4?: number | null;
  diasVencto5?: number | null;
  diasVencto6?: number | null;
  diasVencto7?: number | null;
  diasVencto8?: number | null;
  diasVencto9?: number | null;
  diasVencto10?: number | null;
  diasVencto11?: number | null;
  diasVencto12?: number | null;
  tipo?: string | null;
}

const PADDED_LENGTH = {
  codigo: 8,
  condicao: 40,
  decimal: 8,
  prazoMedio: 4,
  modosPagto: 40,
  dias: 4,
  tipo: 1,
};

const SPACE = ' ';

function padRight(value: string, length: number): string {
  if (value.length >= length) {
    return value.slice(0, length);
  }
  return value.padEnd(length, SPACE);
}

function padLeft(value: string, length: number, char = '0'): string {
  if (value.length >= length) {
    return value.slice(-length);
  }
  return value.padStart(length, char);
}

function formatDecimal(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return padRight('', PADDED_LENGTH.decimal);
  }
  const asString = value.toString();
  return padRight(asString, PADDED_LENGTH.decimal);
}

function formatPrazoMedio(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return padRight('', PADDED_LENGTH.prazoMedio);
  }
  return padRight(value.toString(), PADDED_LENGTH.prazoMedio);
}

function formatZeroPadded(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '0'.repeat(PADDED_LENGTH.dias);
  }
  return padLeft(value.toString(), PADDED_LENGTH.dias, '0');
}

function formatUsaCaixa(value: string | null | undefined): string {
  if (!value) {
    return 'N';
  }
  const normalized = value.trim().toUpperCase();
  return normalized === 'S' ? 'S' : 'N';
}

function formatModosPagto(value: string | null | undefined): string {
  if (!value) {
    return padRight('', PADDED_LENGTH.modosPagto);
  }
  return padRight(value.trim(), PADDED_LENGTH.modosPagto);
}

function formatTipo(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value.trim().slice(0, 1);
}

export function formatPrazo(record: PrazoRecord): string {
  const formatted = [
    padLeft(record.ncond.toString(), PADDED_LENGTH.codigo, '0'),
    padRight(record.condicao.trim(), PADDED_LENGTH.condicao),
    formatDecimal(record.acrescimo ?? null),
    formatDecimal(record.desconto ?? null),
    formatPrazoMedio(record.prazoMedio ?? null),
    formatDecimal(record.valorMinimo ?? null),
    formatUsaCaixa(record.usaCaixa ?? null),
    formatModosPagto(record.modosPagto ?? null),
    formatZeroPadded(record.diasVencto1 ?? null),
    formatZeroPadded(record.diasVencto2 ?? null),
    formatZeroPadded(record.diasVencto3 ?? null),
    formatZeroPadded(record.diasVencto4 ?? null),
    formatZeroPadded(record.diasVencto5 ?? null),
    formatZeroPadded(record.diasVencto6 ?? null),
    formatZeroPadded(record.diasVencto7 ?? null),
    formatZeroPadded(record.diasVencto8 ?? null),
    formatZeroPadded(record.diasVencto9 ?? null),
    formatZeroPadded(record.diasVencto10 ?? null),
    formatZeroPadded(record.diasVencto11 ?? null),
    formatZeroPadded(record.diasVencto12 ?? null),
    formatTipo(record.tipo ?? null),
  ];

  return formatted.join('|');
}

export function buildCadTpgFile(records: PrazoRecord[]): string {
  if (!records.length) {
    return '';
  }
  return records.map(formatPrazo).join('\r\n') + '\r\n';
}
