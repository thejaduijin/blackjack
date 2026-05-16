import * as PIXI from 'pixi.js'
import gsap from 'gsap'

export class Chip extends PIXI.Container {
  value: number

  constructor(value: number, color: number) {
    super()

    this.value = value

    const chip = new PIXI.Graphics()

    chip.beginFill(color)
    chip.drawCircle(0, 0, 35)
    chip.endFill()

    const text = new PIXI.Text(String(value), {
      fill: '#ffffff',
      fontSize: 20,
    })

    text.anchor.set(0.5)

    this.addChild(chip, text)

    this.eventMode = 'static'
    this.cursor = 'pointer'

    this.on('pointerdown', () => {
      gsap.to(this.scale, {
        x: 0.85,
        y: 0.85,
        duration: 0.08,
      })
    })

    this.on('pointerup', () => {
      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: 0.08,
      })
    })

    this.on('pointerupoutside', () => {
      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: 0.08,
      })
    })
  }
}