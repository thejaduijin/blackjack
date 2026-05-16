import * as PIXI from 'pixi.js'
import gsap from 'gsap'

export class ResultPopup extends PIXI.Container {
  bg: PIXI.Graphics
  text: PIXI.Text

  constructor() {
    super()

    this.visible = false

    this.bg = new PIXI.Graphics()

    this.bg.beginFill(0x000000, 0.7)
    this.bg.drawRoundedRect(0, 0, 500, 180, 20)
    this.bg.endFill()

    this.bg.pivot.set(250, 90)

    this.text = new PIXI.Text('', {
      fill: '#FFD700',
      fontSize: 52,
      fontWeight: 'bold',
      align: 'center',
    })

    this.text.anchor.set(0.5)

    this.addChild(this.bg, this.text)
  }

  show(message: string) {
    this.visible = true

    this.alpha = 1
    this.scale.set(0)

    this.text.text = message

    gsap.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.4,
      ease: 'back.out(1.7)',
    })

    gsap.to(this, {
      alpha: 0,
      delay: 2,
      duration: 0.5,
      onComplete: () => {
        this.visible = false
      },
    })
  }
}