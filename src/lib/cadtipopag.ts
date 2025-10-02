export interface CadTipoPagRecord {
  codigo: number;
  descricao: string;
}

const CODE_LENGTH = 2;

function padLeft(value: string, length: number, char = '0'): string {
  if (value.length >= length) {
    return value.slice(-length);
  }
  return value.padStart(length, char);
}

export function formatCadTipoPag(record: CadTipoPagRecord): string {
  const fields = [
    padLeft(record.codigo.toString(), CODE_LENGTH, '0'),
    record.descricao.trim(),
  ];

  return fields.join('|');
}

export function buildCadTipoPagFile(records: CadTipoPagRecord[]): string {
  if (!records.length) {
    return '';
  }
  return records.map(formatCadTipoPag).join('\r\n') + '\r\n';
}
