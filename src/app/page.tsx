'use client';

import { useState } from 'react';
import styles from './page.module.css';

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';
type ExportKey = 'cadtpg' | 'cadtipopag';

interface ExportState {
  status: ExportStatus;
  message: string;
}

const INITIAL_STATE: Record<ExportKey, ExportState> = {
  cadtpg: { status: 'idle', message: '' },
  cadtipopag: { status: 'idle', message: '' },
};

export default function Home() {
  const [exportsState, setExportsState] = useState(INITIAL_STATE);

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

  const handleDownload = async (
    key: ExportKey,
    endpoint: string,
    filename: string,
  ) => {
    updateState(key, { status: 'loading', message: '' });

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        const raw = await response.text();
        let errorMessage = 'Falha ao gerar o arquivo.';
        if (raw) {
          try {
            const payload = JSON.parse(raw);
            if (payload?.error) {
              errorMessage = payload.error;
              if (payload?.details) {
                errorMessage += ` (${payload.details})`;
              }
            } else {
              errorMessage = raw;
            }
          } catch {
            errorMessage = raw;
          }
        }
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

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Exportadores de Layout</h1>
        <p className={styles.description}>
          Conecta na API existente e gera os arquivos de texto nos layouts.
        </p>
        <div className={styles.actions}>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.button}
              onClick={() =>
                handleDownload('cadtpg', '/api/export/cadtpg', 'CADTPG.txt')
              }
              disabled={exportsState.cadtpg.status === 'loading'}
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
              disabled={exportsState.cadtipopag.status === 'loading'}
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
