import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { resolveApiBaseUrl } from '@/services/api';

type ReportScope = 'admin' | 'company';

function reportFileName(scope: ReportScope, extension: string): string {
  const scopeName = scope === 'admin' ? 'administracion' : 'empresa';
  const date = new Date().toISOString().slice(0, 10);
  return `reporte-${scopeName}-${date}.${extension}`;
}

function apiBaseUrl(): string {
  return resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);
}

/**
 * Downloads the institutional PDF report.
 *
 * On web the document is fetched with the bearer token and saved through a
 * temporary Blob URL (the token never appears in the address bar). On native
 * the system browser opens the gateway download route, which accepts the
 * session token as a query parameter so no extra native module is required.
 */
export async function downloadReportPdf(token: string, scope: ReportScope): Promise<void> {
  const url = `${apiBaseUrl()}/${scope}/reports/pdf`;

  if (Platform.OS !== 'web') {
    await WebBrowser.openBrowserAsync(`${url}?token=${encodeURIComponent(token)}`);
    return;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/pdf',
    },
  });

  if (!response.ok) {
    let message = 'No fue posible generar el reporte en PDF.';
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) message = payload.message;
    } catch {
      // The response was not JSON: keep the generic message.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = reportFileName(scope, 'pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
