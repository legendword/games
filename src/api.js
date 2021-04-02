import axios from 'axios'
import { backendBasePath } from 'src/basePath'

axios.defaults.withCredentials = true

//const api = (name, params) => axios.post(`${base}${name}`, JSON.stringify(params));
const api = (port, name, params) => axios.post(`${backendBasePath}:${port}${name}`, params);
export default api;