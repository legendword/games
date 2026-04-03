import axios from 'axios'

axios.defaults.withCredentials = true

const api = (path, name, params) => axios.post(`${path}${name}`, params);
export default api;