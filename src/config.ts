const isDev = import.meta.env.DEV;

export default {
  api: isDev ? 'http://localhost:3001' : 'https://i.data.api.yik.at',
};
