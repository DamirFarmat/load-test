import {$authHost} from "./index";

export const createServer = async (server) => {
    const {data} = await $authHost.post('api/servers/create', server);
    return data;
}

export const deleteServer = async (server) => {
    const {data} = await $authHost.post('api/servers/delete', server);
    return data;
}

export const fetchServer = async () => {
    const {data} = await $authHost.get('api/servers/', );
    return data;
}

export const fetchServerOne = async (id) => {
    const {data} = await $authHost.get(`api/servers/${id}`);
    return data;
}

export const statusServer = async () => {
    const {data} = await $authHost.get('api/servers/status', );
    return data;
}

export const statusServerOne = async (id) => {
    const {data} = await $authHost.get(`api/servers/${id}/status`);
    return data;
}