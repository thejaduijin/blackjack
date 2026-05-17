import * as PIXI from 'pixi.js'
import gsap from 'gsap'

export class IconButton extends PIXI.Container {

    private icon: PIXI.Sprite
    private btn_label: PIXI.Text

    constructor(
        iconAlias: string,
        buttonName: string,
        width: number,
        height: number,
        onClick: () => void
    ) {
        super()

        this.eventMode = 'static'
        this.cursor = 'pointer'
        this.icon = PIXI.Sprite.from(iconAlias)
        this.icon.anchor.set(0.5)
        this.icon.width = width
        this.icon.height = height

        this.addChild(this.icon)

        this.btn_label = new PIXI.Text(buttonName, {
            fill: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold',
            align: 'center'
        })

        this.btn_label.anchor.set(0.5)
        this.btn_label.y = height / 2 + 18
        this.addChild(this.btn_label)

        this.on(
            'pointerdown',
            this.pressAnim.bind(this)
        )

        this.on(
            'pointerup',
            () => {
                this.releaseAnim()
                onClick()
            }
        )

        this.on(
            'pointerupoutside',
            this.releaseAnim.bind(this)
        )
    }

    pressAnim() {
        gsap.to(this.scale, {
            x: 0.9,
            y: 0.9,
            duration: 0.1
        })
    }

    releaseAnim() {
        gsap.to(this.scale, {
            x: 1,
            y: 1,
            duration: 0.1
        })
    }

    setDisabled(disabled: boolean) {
        this.eventMode = disabled ? 'none' : 'static';
        this.alpha = disabled ? 0.5 : 1;
    }
}