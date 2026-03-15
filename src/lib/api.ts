const getApiUrl = (path: string) => {
  const isDev = window.location.port === '5173' || window.location.port === '3000';
  const baseUrl = isDev ? 'https://mindanchor-fkab.onrender.com' : '';
  return `${baseUrl}${path}`;
};

export default getApiUrl;
