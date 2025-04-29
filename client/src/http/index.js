import axios from "axios";
import { toast } from 'react-toastify';

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
})

const $authHost = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
})

const authInterceptor = config => {
    config.headers.authorization = `Bearer ${localStorage.getItem("token")}`
    return config
}

const errorInterceptor = error => {
    if (error.response?.data?.message === "Доступ запрещен") {
        toast.error("У Вас нет прав на это действие");
    } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
    } else {
        toast.error("Произошла ошибка");
    }
    return Promise.reject(error);
}

$authHost.interceptors.request.use(authInterceptor)
$authHost.interceptors.response.use(null, errorInterceptor)
$host.interceptors.response.use(null, errorInterceptor)

export {
    $host,
    $authHost
}