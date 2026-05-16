import * as PIXI from 'pixi.js'

export class Button extends PIXI.Container {
  constructor(
    label: string,
    width: number,
    height: number,
    callback: () => void
  ) {
    super()

    const bg = new PIXI.Graphics()

    bg.beginFill(0x222222)
    bg.drawRoundedRect(0, 0, width, height, 10)
    bg.endFill()

    const text = new PIXI.Text(label, {
      fill: '#ffffff',
      fontSize: 24,
    })

    text.anchor.set(0.5)
    text.x = width / 2
    text.y = height / 2

    this.addChild(bg, text)

    this.eventMode = 'static'
    this.cursor = 'pointer'

    this.on('pointertap', callback)
  }
}