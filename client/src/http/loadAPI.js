import {$authHost} from "./index";

export const createLoad = async (attack) => {
    const {data} = await $authHost.post('api/load/create', attack);
    return data;
}

export const deleteLoad = async (attack) => {
    const {data} = await $authHost.post('api/load/delete', attack);
    return data;
}

export const fetchLoad = async () => {
    const {data} = await $authHost.get('api/load/', );
    return data;
}