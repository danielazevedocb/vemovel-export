'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';
type ExportKey = 'cadtpg' | 'cadtipopag';

interface ExportState {
  status: ExportStatus;
  message: string;
}

interface Empresa {
  id: number;
  nome: string;
  cnpj?: string | null;
}

const STORAGE_KEY = 'vemovel-export:selected-empresa';

const createInitialExportState = (): Record<ExportKey, ExportState> => ({
  cadtpg: { status: 'idle', message: '' },
  cadtipopag: { status: 'idle', message: '' },
});

function parseErrorMessage(raw: string, fallback: string): string {
  if (!raw) {
    return fallback;
  }

  try {
    const payload = JSON.parse(raw);
    if (payload?.error) {
      return payload.details ? `${payload.error} (${payload.details})` : payload.error;
    }
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // ignore JSON parse errors and fallback to raw text
  }

  return raw || fallback;
}

export default function Home() {
  const [empresaId, setEmpresaId] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasLoading, setEmpresasLoading] = useState(false);
  const [empresasError, setEmpresasError] = useState<string | null>(null);
  const [exportsState, setExportsState] = useState(createInitialExportState);

  const empresaIdRef = useRef(empresaId);

  useEffect(() => {
    empresaIdRef.current = empresaId;
  }, [empresaId]);

  const resetExportsState = useCallback(() => {
    setExportsState(createInitialExportState());
  }, []);

  const updateState = (key: ExportKey, changes: Partial<ExportState>) => {
    setExportsState((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...changes },
    }));
  };

  const buildStatusClassName = (status: ExportStatus) => {
    const classes = [styles.status];
    if (status === 'error') {
      classes.push(styles.statusError);
    }
    if (status === 'success') {
      classes.push(styles.statusSuccess);
    }
    return classes.join(' ');
  };

  const ensureSelectionConsistent = useCallback(
    (list: Empresa[]) => {
      const current = empresaIdRef.current;

      if (!list.length) {
        if (current) {
          setEmpresaId('');
        }
        resetExportsState();
        return;
      }

      const hasCurrent =
        current !== '' && list.some((empresa) => String(empresa.id) === current);

      if (hasCurrent) {
        return;
      }

      const next = list.length === 1 ? String(list[0].id) : '';
      if (next !== current) {
        setEmpresaId(next);
        resetExportsState();
      } else if (!current) {
        resetExportsState();
      }
    },
    [resetExportsState],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEmpresaId(stored);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadEmpresas = async () => {
      setEmpresasLoading(true);
      setEmpresasError(null);

      try {
        const response = await fetch('/api/empresas', { cache: 'no-store' });
        if (!response.ok) {
          const raw = await response.text();
          const message = parseErrorMessage(raw, 'Falha ao carregar empresas.');
          if (!cancelled) {
            setEmpresas([]);
            setEmpresasError(message);
            ensureSelectionConsistent([]);
          }
          return;
        }

        const data = (await response.json()) as Empresa[];
        if (!Array.isArray(data)) {
          throw new Error('Resposta inesperada da API.');
        }

        if (!cancelled) {
          setEmpresas(data);
          setEmpresasError(null);
          ensureSelectionConsistent(data);
        }
      } catch (error) {
        if (!cancelled) {
          setEmpresas([]);
          setEmpresasError(`Erro ao carregar empresas: ${String(error)}`);
          ensureSelectionConsistent([]);
        }
      } finally {
        if (!cancelled) {
          setEmpresasLoading(false);
        }
      }
    };

    loadEmpresas();

    return () => {
      cancelled = true;
    };
  }, [ensureSelectionConsistent]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (empresaId) {
      window.localStorage.setItem(STORAGE_KEY, empresaId);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [empresaId]);

  const handleEmpresaChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setEmpresaId(event.target.value);
    resetExportsState();
  };

  const handleDownload = async (
    key: ExportKey,
    endpoint: string,
    filename: string,
  ) => {
    if (!empresaId) {
      updateState(key, {
        status: 'error',
        message: 'Selecione uma empresa para gerar o arquivo.',
      });
      return;
    }

    updateState(key, { status: 'loading', message: '' });

    try {
      const response = await fetch(
        `${endpoint}?empresaId=${encodeURIComponent(empresaId)}`,
      );
      if (!response.ok) {
        const raw = await response.text();
        const errorMessage = parseErrorMessage(raw, 'Falha ao gerar o arquivo.');
        updateState(key, { status: 'error', message: errorMessage });
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      updateState(key, {
        status: 'success',
        message: `Arquivo ${filename} gerado com sucesso.`,
      });
    } catch (error) {
      updateState(key, {
        status: 'error',
        message: `Erro ao gerar o arquivo: ${String(error)}`,
      });
    }
  };

  const isActionDisabled = (key: ExportKey) =>
    !empresaId || exportsState[key].status === 'loading' || empresasLoading;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Exportadores de Layout</h1>
        <p className={styles.description}>
          Selecione a empresa para gerar os arquivos de texto nos
          layouts.
        </p>

        <div className={styles.selector}>
          <label htmlFor="empresa" className={styles.label}>
            Empresa
          </label>
          <select
            id="empresa"
            className={styles.select}
            value={empresaId}
            onChange={handleEmpresaChange}
            disabled={empresasLoading || !empresas.length}
          >
            <option value="">Selecione uma empresa</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={String(empresa.id)}>
                {empresa.nome}
              </option>
            ))}
          </select>

          {empresasLoading && (
            <span className={styles.helper}>Carregando empresas...</span>
          )}

          {!empresasLoading && !empresas.length && !empresasError && (
            <span className={styles.helper}>
              Cadastre empresas na API para liberar as exportações.
            </span>
          )}

          {empresasError && (
            <span className={`${styles.helper} ${styles.helperError}`}>
              {empresasError}
            </span>
          )}

          {!empresaId && !empresasLoading && empresas.length > 0 && (
            <span className={styles.helper}>
              Escolha uma empresa para liberar os botões de exportação.
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.button}
              onClick={() =>
                handleDownload('cadtpg', '/api/export/cadtpg', 'CADTPG.txt')
              }
              disabled={isActionDisabled('cadtpg')}
            >
              {exportsState.cadtpg.status === 'loading'
                ? 'Gerando...'
                : 'Gerar arquivo CADTPG'}
            </button>
            {exportsState.cadtpg.message && (
              <span className={buildStatusClassName(exportsState.cadtpg.status)}>
                {exportsState.cadtpg.message}
              </span>
            )}
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.button}
              onClick={() =>
                handleDownload(
                  'cadtipopag',
                  '/api/export/cadtipopag',
                  'CADTIPOPAG.txt',
                )
              }
              disabled={isActionDisabled('cadtipopag')}
            >
              {exportsState.cadtipopag.status === 'loading'
                ? 'Gerando...'
                : 'Gerar arquivo CADTIPOPAG'}
            </button>
            {exportsState.cadtipopag.message && (
              <span className={buildStatusClassName(exportsState.cadtipopag.status)}>
                {exportsState.cadtipopag.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
