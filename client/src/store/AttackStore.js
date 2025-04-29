import {makeAutoObservable} from "mobx";

export default class AttackStore {
    constructor() {
        this._attacks = []
        makeAutoObservable(this)
    }

    setAttacks(attacks) {
        this._attacks = attacks;
    }

    get attacks() {
        return this._attacks;
    }
}