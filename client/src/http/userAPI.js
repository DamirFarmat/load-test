import {$authHost, $host} from "./index";
import {jwtDecode} from "jwt-decode";

export const registration = async (email, password) => {
    const {data} = await $host.post('api/user/registration', {email, password, role: 'USER'});
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token);
}

export const login = async (email, password) => {
    const {data} = await $host.post('api/user/login', {email, password});
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token);
}

export const check = async () => {
    const {data} = await $authHost.get('api/user/auth', );
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token);
}

export const changePassword = async (oldPassword, newPassword) => {
    const {data} = await $authHost.post('api/user/change-password', {oldPassword, newPassword});
    return data;
}

export const getAllUsers = async () => {
    const {data} = await $authHost.get('api/user/all');
    return data;
}

export const changeUserRole = async (id, role) => {
    const {data} = await $authHost.post('api/user/change-role', {id, role});
    return data;
}

export const deleteUser = async (id) => {
    const {data} = await $authHost.post('api/user/delete', {id});
    return data;
}

export const createUser = async (userData) => {
    const {data} = await $authHost.post('api/user/create', userData);
    return data;
}