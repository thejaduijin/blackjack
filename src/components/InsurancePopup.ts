import * as PIXI from 'pixi.js'
import gsap from 'gsap'
import { IconButton } from './IconButton'

export class InsurancePopup extends PIXI.Container {
    private bg: PIXI.Graphics
    private titleText: PIXI.Text
    private amountText: PIXI.Text
    private yesBtn!: IconButton
    private noBtn!: IconButton

    constructor() {
        super()
        this.visible = false

        // Background
        this.bg = new PIXI.Graphics()
        this.bg.beginFill(0x000000, 0.85)
        this.bg.drawRoundedRect(0, 0, 500, 240, 20)
        this.bg.endFill()
        this.bg.pivot.set(250, 120)
        this.addChild(this.bg)

        // Title
        this.titleText = new PIXI.Text('INSURANCE?', {
            fill: '#FFD700',
            fontSize: 42,
            fontWeight: 'bold',
            align: 'center',
        })
        this.titleText.anchor.set(0.5)
        this.titleText.y = -50
        this.addChild(this.titleText)

        // Amount text
        this.amountText = new PIXI.Text('', {
            fill: '#ffffff',
            fontSize: 24,
            align: 'center',
        })
        this.amountText.anchor.set(0.5)
        this.amountText.y = 10
        this.addChild(this.amountText)

        // Yes button
        this.yesBtn = new IconButton('btn_insurance', 'YES', 48, 48, () => { })
        this.yesBtn.position.set(-80, 70)
        this.addChild(this.yesBtn)

        // No button
        this.noBtn = new IconButton('btn_clear', 'NO', 48, 48, () => { })
        this.noBtn.position.set(80, 70)
        this.addChild(this.noBtn)
    }

    show(insuranceAmount: number, onYes: () => void, onNo: () => void) {
        this.visible = true
        this.alpha = 1
        this.scale.set(0)

        if (insuranceAmount === 0) {
            this.amountText.text = 'Bet too small for insurance'
            this.yesBtn.setDisabled(true)  // can't take insurance
        } else {
            this.amountText.text = `Insurance bet: $${insuranceAmount}`
            this.yesBtn.setDisabled(false)
        }

        this.amountText.text = `Insurance bet: $${insuranceAmount}`

        // Wire up callbacks fresh each show
        this.yesBtn.removeAllListeners('pointertap')
        this.noBtn.removeAllListeners('pointertap')

        this.yesBtn.on('pointertap', () => {
            this.hide()
            onYes()
        })

        this.noBtn.on('pointertap', () => {
            this.hide()
            onNo()
        })

        gsap.to(this.scale, {
            x: 1,
            y: 1,
            duration: 0.4,
            ease: 'back.out(1.7)',
        })
    }

    hide() {
        gsap.to(this, {
            alpha: 0,
            duration: 0.3,
            onComplete: () => {
                this.visible = false
            }
        })
    }
}