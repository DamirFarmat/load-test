import {makeAutoObservable} from "mobx";

export default class ServerStore {
    constructor() {
        this._servers = []
        makeAutoObservable(this)
    }

    setServer(servers) {
        this._servers = servers;
    }

    get servers() {
        return this._servers;
    }
}