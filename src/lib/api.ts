const getApiUrl = (path: string) => {
  // In development, we use the Vite proxy
  // In production (Capacitor), we might need an absolute URL
  // For now, we'll use the current origin if it's not a file/capacitor scheme
  const isWeb = window.location.protocol.startsWith('http');
  const baseUrl = isWeb ? '' : 'http://localhost:5000'; // Default to localhost for local testing
  return `${baseUrl}${path}`;
};

export default getApiUrl;
