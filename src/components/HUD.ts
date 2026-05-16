import * as PIXI from 'pixi.js'

export class HUD extends PIXI.Container {
  balanceText: PIXI.Text
  betText: PIXI.Text

  constructor() {
    super()

    this.balanceText = new PIXI.Text('Balance: $5000', {
      fill: '#ffffff',
      fontSize: 28,
    })

    this.betText = new PIXI.Text('Bet: $0', {
      fill: '#ffffff',
      fontSize: 28,
    })

    this.betText.y = 40

    this.addChild(this.balanceText, this.betText)
  }

  update(balance: number, bet: number) {
    this.balanceText.text = `Balance: $${balance}`
    this.betText.text = `Bet: $${bet}`
  }
}