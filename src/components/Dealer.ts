import * as PIXI from 'pixi.js'
import gsap from 'gsap'

export class Dealer extends PIXI.Container {
  sprite: PIXI.Graphics

  constructor() {
    super()

    this.sprite = new PIXI.Graphics()

    this.sprite.beginFill(0xffccaa)
    this.sprite.drawCircle(0, 0, 50)
    this.sprite.endFill()

    this.addChild(this.sprite)
  }

  playDealAnimation() {
    gsap.to(this.sprite.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
    })
  }
}