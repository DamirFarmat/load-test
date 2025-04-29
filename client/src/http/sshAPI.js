import {$authHost} from "./index";

export const execCommandOne = async (id, command) => {
    const { data } = await $authHost.post(`api/ssh/execute/${id}`, command);
    return data;
};

export const execCommand = async (command) => {
    const {data} = await $authHost.post('api/ssh/execute', command);
    return data;
}
