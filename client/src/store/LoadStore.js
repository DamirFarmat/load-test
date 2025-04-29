import {makeAutoObservable} from "mobx";

export default class LoadStore {
    constructor() {
        this._loads = []
        makeAutoObservable(this)
    }

    setLoads(loads) {
        this._loads = loads;
    }

    get loads() {
        return this._loads;
    }
}