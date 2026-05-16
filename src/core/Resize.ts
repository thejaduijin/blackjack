import * as PIXI from 'pixi.js'

export function resize(app: PIXI.Application) {
  const resizeHandler = () => {
    const parent = app.view.parentElement

    if (!parent) return

    app.renderer.resize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', resizeHandler)

  resizeHandler()
}