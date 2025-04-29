import { $authHost } from "./index";

export const monitorTarget = async (target, type) => {
    try {
        const { data } = await $authHost.post('api/monitoring/monitor', { target, type });
        return data;
    } catch (error) {
        console.error("Ошибка мониторинга:", error);
        return null;
    }
};