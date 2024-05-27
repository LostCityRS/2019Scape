import Entity from '#lostcity/entity/Entity.js';

export default class Npc extends Entity {
    constructor() {
        super(0, 0, 0, 0, 0);
    }

    resetEntity(respawn: boolean): void {
    }
}