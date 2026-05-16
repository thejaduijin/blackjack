import * as PIXI from 'pixi.js'
import { Chip } from './Chip'

export class ChipTray extends PIXI.Container {
  constructor(onBet: (amount: number) => void) {
    super()

    const chips = [
      { value: 1, color: 0x444444 },
      { value: 5, color: 0xff0000 },
      { value: 10, color: 0x0000ff },
      { value: 25, color: 0x00aa00 },
      { value: 100, color: 0x000000 },
    ]

    chips.forEach((data, index) => {
      const chip = new Chip(data.value)

      chip.x = index * 90

      chip.on('pointertap', () => {
        onBet(data.value)
      })

      this.addChild(chip)
    })
  }
}