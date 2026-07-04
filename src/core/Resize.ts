import * as PIXI from 'pixi.js'
import { Config } from './Config'

export function resize(app: PIXI.Application) {
    const resizeHandler = () => {
        const canvas = app.canvas as HTMLCanvasElement

        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        const gameRatio = Config.width / Config.height
        const windowRatio = windowWidth / windowHeight

        let scale: number

        if (windowRatio > gameRatio) {
            // Window is wider than game ratio — fit to height
            scale = windowHeight / Config.height
        } else {
            // Window is taller/narrower — fit to width
            scale = windowWidth / Config.width
        }

        const scaledWidth = Config.width * scale
        const scaledHeight = Config.height * scale

        canvas.style.width = `${scaledWidth}px`
        canvas.style.height = `${scaledHeight}px`

        canvas.style.position = 'absolute'
        canvas.style.left = `${(windowWidth - scaledWidth) / 2}px`
        canvas.style.top = `${(windowHeight - scaledHeight) / 2}px`
    }

    window.addEventListener('resize', resizeHandler)
    resizeHandler()
}