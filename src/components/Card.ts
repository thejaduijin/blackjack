import * as PIXI from 'pixi.js'

export class Card extends PIXI.Container {
    constructor(cardName: string) {
        super()

        const texture = PIXI.Texture.from(cardName)

        const sprite = new PIXI.Sprite(texture)

        sprite.width = 100
        sprite.height = 140

        this.addChild(sprite)
    }
}