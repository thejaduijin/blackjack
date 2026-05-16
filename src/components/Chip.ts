import * as PIXI from 'pixi.js'
import gsap from 'gsap'

export class Chip extends PIXI.Container {
  amount: number

  constructor(amount: number) {
    super()

    this.amount = amount

    let alias = 'chip_1'

    switch (amount) {
      case 1:
        alias = 'chip_1'
        break

      case 5:
        alias = 'chip_5'
        break

      case 10:
        alias = 'chip_10'
        break

      case 25:
        alias = 'chip_25'
        break

      case 50:
        alias = 'chip_50'
        break

      case 100:
        alias = 'chip_100'
        break
    }

    const sprite = PIXI.Sprite.from(alias)

    sprite.anchor.set(0.5)

    sprite.width = 70
    sprite.height = 70

    this.addChild(sprite)

    this.eventMode = 'static'
    this.cursor = 'pointer'

    this.on('pointerdown', () => {

      gsap.to(this.scale, {
        x: 0.9,
        y: 0.9,
        duration: 0.1
      })

    })

    this.on('pointerup', () => {

      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: 0.1
      })

    })

    this.on('pointerupoutside', () => {

      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: 0.1
      })

    })
  }
}