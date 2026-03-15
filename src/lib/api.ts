const getApiUrl = (path: string) => {
  // In development, we use the Vite proxy
  // In production (Capacitor), we might need an absolute URL
  const isWeb = window.location.protocol.startsWith('http') && !window.location.host.includes(':3000');

  // If we're on port 3000, we're likely in development and using the proxy
  if (window.location.port === '3000') {
    return path;
  }

  // For mobile or other cases, we might need a specific IP or domain
  // Ideally this should be configurable via env or a config file
  // For now, let's use a placeholder that users can easily find and change,
  // or default to the current origin if it seems like a web app.

  const baseUrl = isWeb ? '' : 'https://mindanchor-fkab.onrender.com'; // Your Render URL
  return `${baseUrl}${path}`;
};

export default getApiUrl;
