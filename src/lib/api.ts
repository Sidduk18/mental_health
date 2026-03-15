const getApiUrl = (path: string) => {
  // Always point to your live Render backend so it works locally and when deployed
  const baseUrl = 'https://mindanchor-fkab.onrender.com';
  return `${baseUrl}${path}`;
};

export default getApiUrl;
