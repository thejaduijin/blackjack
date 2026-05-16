import * as PIXI from 'pixi.js'

import { Dealer } from '../components/Dealer'
import { ChipTray } from '../components/ChipTray'
import { HUD } from '../components/HUD'
import { Button } from '../components/Button'
import { GameManager } from '../managers/GameManager'
import { BetManager } from '../managers/BetManager'
import { Card } from '../components/Card'
import { ResultPopup } from '../components/ResultPopup'

export class GameScene extends PIXI.Container {
    gameManager = new GameManager()
    betManager = new BetManager()
    showDealerCards = false
    newGameBtn!: Button
    clearBtn!: Button
    undoBtn!: Button
    doubleBtn!: Button
    dealBtn!: Button
    hitBtn!: Button
    standBtn!: Button
    chipTray!: ChipTray

    dealer = new Dealer()
    hud = new HUD()
    popup = new ResultPopup()

    playerContainer = new PIXI.Container()
    dealerContainer = new PIXI.Container()

    refreshHUD() {
        this.hud.update(
            this.betManager.balance,
            this.betManager.currentBet
        )
    }

    startGame() {
        this.disableBettingControls();
        this.enableActionButtons();

        this.playerContainer.removeChildren()
        this.dealerContainer.removeChildren()

        this.showDealerCards = false

        this.gameManager.startRound()

        this.dealer.playDealAnimation()

        this.renderHands()

        if (this.gameManager.playerBlackjack()) {
            this.betManager.balance += this.betManager.currentBet * 2.5

            this.popup.show('BLACKJACK!')

            this.betManager.currentBet = 0

            this.refreshHUD()

            this.newGameBtn.visible = true
            this.disableGameplayButtons()

            return
        }
    }

    hitPlayer() {
        this.gameManager.hitPlayer()

        this.renderHands()

        if (this.gameManager.playerBusted()) {
            console.log('PLAYER BUSTED')
            this.popup.show('BUSTED!')
            this.betManager.currentBet = 0
            this.refreshHUD()
            this.newGameBtn.visible = true
            this.disableGameplayButtons()
        }
    }

    dealerTurn() {
        this.showDealerCards = true

        this.renderHands()

        // DEALER BLACKJACK CHECK HERE
        if (this.gameManager.dealerBlackjack()) {
            this.popup.show('DEALER BLACKJACK!')

            this.betManager.currentBet = 0

            this.refreshHUD()
            this.newGameBtn.visible = true
            this.disableGameplayButtons()

            return
        }

        while (this.gameManager.getDealerTotal() < 17) {
            this.gameManager.hitDealer()
        }

        this.renderHands()

        this.checkWinner()
    }

    checkWinner() {
        const player = this.gameManager.getPlayerTotal()
        const dealer = this.gameManager.getDealerTotal()

        const bet = this.betManager.currentBet

        if (dealer > 21) {
            this.betManager.balance += bet * 2
            this.popup.show('PLAYER WINS!')
        } else if (player > dealer) {
            this.betManager.balance += bet * 2
            this.popup.show('PLAYER WINS!')
        } else if (dealer > player) {
            this.popup.show('DEALER WINS!')
        } else {
            this.betManager.balance += bet
            this.popup.show('PUSH!')
        }

        this.betManager.currentBet = 0

        this.refreshHUD()
        this.newGameBtn.visible = true
        this.disableGameplayButtons()
    }

    renderHands() {
        this.playerContainer.removeChildren()
        this.dealerContainer.removeChildren()

        this.gameManager.playerCards.forEach((value, index) => {
            const card = new Card(value)

            card.x = index * 90

            this.playerContainer.addChild(card)
        })

        this.gameManager.dealerCards.forEach((value, index) => {
            let cardValue = value

            if (index === 1 && !this.showDealerCards) {
                cardValue = 'BACK'
            }

            const card = new Card(cardValue)

            card.x = index * 90

            this.dealerContainer.addChild(card)
        })
    }

    resetGame() {
        this.playerContainer.removeChildren()
        this.dealerContainer.removeChildren()

        this.gameManager.playerCards = []
        this.gameManager.dealerCards = []

        this.showDealerCards = false

        this.newGameBtn.visible = false

        this.popup.visible = false

        this.enableGameplayButtons();
        this.enableBettingControls();
        this.disableActionButtons()

        this.refreshHUD()
    }

    constructor(app: PIXI.Application) {
        super()

        this.dealer.x = app.screen.width / 2
        this.dealer.y = 120

        this.addChild(this.dealer)

        this.hud.x = 20
        this.hud.y = 20

        this.addChild(this.hud)

        this.playerContainer.y = app.screen.height - 260
        this.playerContainer.x = 400

        this.dealerContainer.y = 220
        this.dealerContainer.x = 400

        this.addChild(this.playerContainer)
        this.addChild(this.dealerContainer)

        this.chipTray = new ChipTray((amount) => {
            this.betManager.placeBet(amount)
            this.refreshHUD()
        })

        this.chipTray.x = app.screen.width / 2 - 200
        this.chipTray.y = app.screen.height - 100

        this.addChild(this.chipTray);

        this.popup.x = app.screen.width / 2
        this.popup.y = app.screen.height / 2

        this.addChild(this.popup)

        const buttonY = app.screen.height - 80

        this.clearBtn = new Button('CLEAR', 120, 50, () => {
            this.betManager.clearBet()
            this.refreshHUD()
        })

        this.clearBtn.position.set(40, buttonY)
        this.addChild(this.clearBtn)

        this.undoBtn = new Button('UNDO', 120, 50, () => {
            this.betManager.undoBet()
            this.refreshHUD()
        })

        this.undoBtn.position.set(180, buttonY)
        this.addChild(this.undoBtn)

        this.doubleBtn = new Button('DOUBLE', 120, 50, () => {
            this.betManager.doubleBet()
            this.refreshHUD()
        })

        this.doubleBtn.position.set(320, buttonY)
        this.addChild(this.doubleBtn)

        this.dealBtn = new Button('DEAL', 120, 50, () => {
            this.startGame()
        })

        this.dealBtn.position.set(460, buttonY)
        this.addChild(this.dealBtn)

        this.hitBtn = new Button('HIT', 120, 50, () => {
            this.hitPlayer()
        })

        this.hitBtn.position.set(app.screen.width - 280, buttonY)
        this.addChild(this.hitBtn)

        this.standBtn = new Button('STAND', 120, 50, () => {
            this.dealerTurn()
        })

        this.standBtn.position.set(app.screen.width - 140, buttonY)
        this.addChild(this.standBtn)



        this.newGameBtn = new Button('NEW GAME', 220, 70, () => {
            this.resetGame()
        })

        this.newGameBtn.position.set(
            app.screen.width - 250,
            app.screen.height / 2 + 450
        )

        this.newGameBtn.visible = false

        this.addChild(this.newGameBtn)


        this.disableActionButtons()
    }


    disableGameplayButtons() {
        this.clearBtn.eventMode = 'none'
        this.undoBtn.eventMode = 'none'
        this.doubleBtn.eventMode = 'none'
        this.dealBtn.eventMode = 'none'
        this.hitBtn.eventMode = 'none'
        this.standBtn.eventMode = 'none'
        this.chipTray.eventMode = 'none'

        this.clearBtn.alpha = 0.5
        this.undoBtn.alpha = 0.5
        this.doubleBtn.alpha = 0.5
        this.dealBtn.alpha = 0.5
        this.hitBtn.alpha = 0.5
        this.standBtn.alpha = 0.5
        this.chipTray.alpha = 0.5
    }

    enableGameplayButtons() {
        this.clearBtn.eventMode = 'static'
        this.undoBtn.eventMode = 'static'
        this.doubleBtn.eventMode = 'static'
        this.dealBtn.eventMode = 'static'
        this.hitBtn.eventMode = 'static'
        this.standBtn.eventMode = 'static'
        this.chipTray.eventMode = 'static'

        this.clearBtn.alpha = 1
        this.undoBtn.alpha = 1
        this.doubleBtn.alpha = 1
        this.dealBtn.alpha = 1
        this.hitBtn.alpha = 1
        this.standBtn.alpha = 1
        this.chipTray.alpha = 1
    }

    disableBettingControls() {
        this.dealBtn.eventMode = 'none'
        this.clearBtn.eventMode = 'none'
        this.undoBtn.eventMode = 'none'
        this.doubleBtn.eventMode = 'none'
        this.chipTray.eventMode = 'none'

        this.dealBtn.alpha = 0.5
        this.clearBtn.alpha = 0.5
        this.undoBtn.alpha = 0.5
        this.doubleBtn.alpha = 0.5
        this.chipTray.alpha = 0.5
    }

    enableBettingControls() {
        this.dealBtn.eventMode = 'static'
        this.clearBtn.eventMode = 'static'
        this.undoBtn.eventMode = 'static'
        this.doubleBtn.eventMode = 'static'
        this.chipTray.eventMode = 'static'

        this.dealBtn.alpha = 1
        this.clearBtn.alpha = 1
        this.undoBtn.alpha = 1
        this.doubleBtn.alpha = 1
        this.chipTray.alpha = 1
    }

    disableActionButtons() {
        this.hitBtn.eventMode = 'none'
        this.standBtn.eventMode = 'none'

        this.hitBtn.alpha = 0.5
        this.standBtn.alpha = 0.5
    }

    enableActionButtons() {
        this.hitBtn.eventMode = 'static'
        this.standBtn.eventMode = 'static'

        this.hitBtn.alpha = 1
        this.standBtn.alpha = 1
    }
}