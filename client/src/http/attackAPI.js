import {$authHost} from "./index";

export const createAttack = async (attack) => {
    const {data} = await $authHost.post('api/attack/create', attack);
    return data;
}

export const deleteAttack = async (attack) => {
    const {data} = await $authHost.post('api/attack/delete', attack);
    return data;
}

export const fetchAttack = async () => {
    const {data} = await $authHost.get('api/attack/', );
    return data;
}

export const fetchAttackOne = async (id) => {
    const {data} = await $authHost.get(`api/attack/${id}`);
    return data;
}

export const startAttack = async (id) => {
    const {data} = await $authHost.post('api/attack/start', { id });
    return data;
};

export const stopAttack = async (id) => {
    const {data} = await $authHost.post('api/attack/stop', { id });
    return data;
};

export const saveChartData = async (id, chartData) => {
    const {data} = await $authHost.post('api/attack/save-chart', { id, chartData });
    return data;
};

export const editAttack = async (attackData) => {
    const {data} = await $authHost.put('api/attack/edit', attackData);
    return data;
};

export const duplicateAttack = async (attackId) => {
    const {data} = await $authHost.post('api/attack/duplicate', { id: attackId });
    return data;
}