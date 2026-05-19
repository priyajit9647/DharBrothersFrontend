import React from 'react';

export default function DownloadDocumentButton({
  documentVersion = '',
  documentFilePath = '',
  documentFileName = '',
  openInNewTab = false,
  accessToken = '',
}) {
  const rawPath = documentFilePath || '';

  // Normalize Windows backslashes to forward slashes
  const normalizedPath = rawPath.replace(/\\+/g, '/');

  // If filename not provided, try to infer from path
  const inferredName = documentFileName || (normalizedPath ? normalizedPath.split('/').pop() : 'file');

  // Use backend base URL from Vite env when available
  const rawBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? String(import.meta.env.VITE_API_BASE_URL)
    : '';
  const base = rawBase ? rawBase.replace(/\/+$/g, '') : '';

  const buildUrl = () => (base ? `${base}/api/v1/orders/admin/download` : `/api/v1/orders/admin/download`);

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename || inferredName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const url = buildUrl();
    const payload = {
      filePath: normalizedPath,
      fileName: inferredName,
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Download failed: ${res.status}`);
      }

      const blob = await res.blob();

      // Try to parse filename from Content-Disposition header if present
      const cd = res.headers.get('Content-Disposition') || '';
      let outName = inferredName;
      const m = /filename\*=UTF-8''([^;\n]+)/i.exec(cd) || /filename="?([^";\n]+)"?/i.exec(cd);
      if (m && m[1]) {
        try {
          outName = decodeURIComponent(m[1]);
        } catch (err) {
          outName = m[1];
        }
      }

      downloadBlob(blob, outName);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Download failed', err);
      // fallback: open the POST url in new tab with query if allowed
      if (openInNewTab) {
        window.open(buildUrl(), '_blank');
      } else {
        window.location.href = buildUrl();
      }
    }
  };

  return (
    <button
      id="documentVersion"
      aria-label={`Download ${inferredName}`}
      onClick={handleClick}
      style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: '#1976d2' }}
    >
      {`V: ${documentVersion}  N: ${inferredName}`}
    </button>
  );
}
