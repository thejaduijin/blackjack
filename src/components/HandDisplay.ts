import * as PIXI from 'pixi.js'
import { Card } from './Card'

export class HandDisplay extends PIXI.Container {
    private cards: PIXI.Container
    private badge: PIXI.Graphics
    private badgeText: PIXI.Text
    private betLabel: PIXI.Text

    constructor() {
        super()

        this.cards = new PIXI.Container()
        this.addChild(this.cards)

        // Total badge — dark rounded rect, gold text
        this.badge = new PIXI.Graphics()
        this.badge.beginFill(0x1a472a, 0.9)
        this.badge.drawRoundedRect(0, 0, 48, 28, 8)
        this.badge.endFill()
        this.badge.lineStyle(2, 0xFFD700)
        this.badge.drawRoundedRect(0, 0, 48, 28, 8)
        this.badge.visible = false
        this.addChild(this.badge)

        this.badgeText = new PIXI.Text('0', {
            fill: '#FFD700',
            fontSize: 16,
            fontWeight: 'bold',
        })
        this.badgeText.anchor.set(0.5)
        this.badgeText.x = 24
        this.badgeText.y = 14
        this.addChild(this.badgeText)

        // Bet label — below hand
        this.betLabel = new PIXI.Text('', {
            fill: '#00FF88',
            fontSize: 18,
            fontWeight: 'bold',
        })
        this.betLabel.anchor.set(0.5)
        this.betLabel.y = 170
        this.addChild(this.betLabel)
    }

    render(cardNames: string[], total: number, bet: number, isActive: boolean) {
        this.cards.removeChildren()

        // Overlapping stack — each card offset by 20px down and right
        cardNames.forEach((name, index) => {
            const card = new Card(name)
            card.x = index * 20
            card.y = index * 20
            this.cards.addChild(card)
        })

        // Badge position — top right of last card
        const lastCardX = (cardNames.length - 1) * 20
        this.badge.x = lastCardX + 80
        this.badge.y = -10
        this.badgeText.x = lastCardX + 80 + 24
        this.badgeText.y = -10 + 14

        this.badge.visible = cardNames.length > 0
        this.badgeText.text = String(total)

        // Bet label
        // this.betLabel.text = `$${bet}`
        // this.betLabel.x = lastCardX / 2 + 50
        // this.betLabel.y = 220


        // Active hand highlight — gold tint on badge border
        this.badge.clear()
        this.badge.beginFill(0x1a472a, 0.9)
        this.badge.drawRoundedRect(0, 0, 48, 28, 8)
        this.badge.endFill()
        this.badge.lineStyle(2, isActive ? 0xFFD700 : 0x888888)
        this.badge.drawRoundedRect(0, 0, 48, 28, 8)

        // this.betLabel.text = bet > 0 ? `$${bet}` : ''
    }

    clear() {
        this.cards.removeChildren()
        this.badge.visible = false
        this.betLabel.text = ''
    }
}