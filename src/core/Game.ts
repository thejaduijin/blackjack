import * as PIXI from 'pixi.js'
import { Config } from './Config'
import { GameScene } from '../scenes/GameScene'
import { resize } from './Resize'
import { manifest } from '../assets/manifest'

export class Game {
    public app: PIXI.Application

    constructor() {
        this.app = new PIXI.Application()

        this.init()
    }

    async init() {
        await this.app.init({
            width: Config.width,
            height: Config.height,
            background: Config.background,
            // resizeTo: window,
        })

        document.body.appendChild(this.app.canvas)

        await PIXI.Assets.init({ manifest })

        await PIXI.Assets.loadBundle('cards')

        resize(this.app)

        const gameScene = new GameScene(this.app)

        this.app.stage.addChild(gameScene)
    }
}