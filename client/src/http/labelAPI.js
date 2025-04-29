import { $authHost } from "./index";

export const fetchLabels = async () => {
    const { data } = await $authHost.get('api/label/');
    return data;
};

export const deleteLabel = async (id) => {
    const { data } = await $authHost.delete(`api/label/${id}`);
    return data;
}; 