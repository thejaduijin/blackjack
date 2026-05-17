import * as PIXI from 'pixi.js'

import { Dealer } from '../components/Dealer'
import { ChipTray } from '../components/ChipTray'
import { HUD } from '../components/HUD'
import { GameManager } from '../managers/GameManager'
import { BetManager } from '../managers/BetManager'
import { Card } from '../components/Card'
import { ResultPopup } from '../components/ResultPopup'
import { Chip } from '../components/Chip'
import gsap from 'gsap'
import { IconButton } from '../components/IconButton'

export class GameScene extends PIXI.Container {
    gameManager = new GameManager()
    betManager = new BetManager()
    showDealerCards = false
    newGameBtn!: IconButton
    clearBtn!: IconButton
    undoBtn!: IconButton
    doubleBtn!: IconButton
    dealBtn!: IconButton
    hitBtn!: IconButton
    standBtn!: IconButton
    chipTray!: ChipTray

    betSpot!: PIXI.Graphics

    dealer = new Dealer()
    hud = new HUD()
    popup = new ResultPopup()

    playerContainer = new PIXI.Container()
    dealerContainer = new PIXI.Container()
    betContainer = new PIXI.Container()

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

            this.refreshHUD();

            this.newGameBtn.visible = true
            this.disableGameplayButtons()
            return;
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
            this.popup.show('DEALER BLACKJACK!');
            this.betManager.currentBet = 0;
            this.refreshHUD();
            this.newGameBtn.visible = true;
            this.disableGameplayButtons();
            return;
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

        this.betContainer.removeChildren()
    }

    addDealer(app: PIXI.Application) {
        this.dealer.x = app.screen.width / 2
        this.dealer.y = 120
        this.addChild(this.dealer);

        this.dealerContainer.y = 220
        this.dealerContainer.x = 400
        this.addChild(this.dealerContainer)
    }

    createHUD() {
        this.hud.x = 20
        this.hud.y = 20
        this.addChild(this.hud)
    }

    addPlayer(app: PIXI.Application) {
        this.playerContainer.y = app.screen.height - 260
        this.playerContainer.x = 400
        this.addChild(this.playerContainer)
    }

    createChipTray(app: PIXI.Application) {
        this.chipTray = new ChipTray((amount) => {
            this.betManager.placeBet(amount)
            this.renderPlacedBet(amount)
            this.refreshHUD()
        })

        this.chipTray.x = app.screen.width / 2 - 200
        this.chipTray.y = app.screen.height - 60
        this.addChild(this.chipTray);
    }

    createPopUp(app: PIXI.Application) {
        this.popup.x = app.screen.width / 2
        this.popup.y = app.screen.height / 2
        this.addChild(this.popup);
    }

    clearButton(yPos: number) {
        this.clearBtn = new IconButton('btn_clear', 'CLEAR', 48, 48, () => {
            this.betManager.clearBet()
            this.betContainer.removeChildren()
            this.refreshHUD()
        })
        this.clearBtn.position.set(40, yPos)
        this.addChild(this.clearBtn)
    }

    undoButton(yPos: number) {
        this.undoBtn = new IconButton('btn_undo', 'UNDO', 48, 48, () => {
            this.betManager.undoBet()
            if (this.betContainer.children.length > 0) {
                this.betContainer.removeChildAt(
                    this.betContainer.children.length - 1
                )
            }
            this.refreshHUD()
        })
        this.undoBtn.position.set(130, yPos)
        this.addChild(this.undoBtn)
    }

    doubleButton(yPos: number) {
        this.doubleBtn = new IconButton('btn_double', 'DOUBLE', 48, 48, () => {
            this.betManager.doubleBet()
            this.refreshHUD()
        })
        this.doubleBtn.position.set(220, yPos)
        this.addChild(this.doubleBtn)
    }

    dealButton(yPos: number) {
        this.dealBtn = new IconButton('btn_deal2', 'DEAL', 48, 48, () => {
            this.startGame()
        })
        this.dealBtn.position.set(310, yPos)
        this.addChild(this.dealBtn)
    }

    hitButton(app: any, yPos: number) {
        this.hitBtn = new IconButton('btn_hand', 'HIT', 48, 48, () => {
            this.hitPlayer()
        })
        this.hitBtn.position.set(app.screen.width - 150, yPos)
        this.addChild(this.hitBtn)
    }

    standButton(app: any, yPos: number) {
        this.standBtn = new IconButton('btn_stand', 'STAND', 48, 48, () => {
            this.dealerTurn()
        })
        this.standBtn.position.set(app.screen.width - 60, yPos)
        this.addChild(this.standBtn);
    }

    newGameButton(app: any, yPos: number) {
        this.newGameBtn = new IconButton('btn_new_game', 'NEW GAME', 48, 48, () => {
            this.resetGame()
        })
        this.newGameBtn.position.set(
            app.screen.width - 260,
            yPos
        )
        this.newGameBtn.visible = false;
        this.addChild(this.newGameBtn);
    }

    createBtn(app: PIXI.Application) {
        const buttonY = app.screen.height - 80
        this.clearButton(buttonY);
        this.undoButton(buttonY);
        this.doubleButton(buttonY);
        this.dealButton(buttonY);
        this.hitButton(app, buttonY);
        this.standButton(app, buttonY);
        this.newGameButton(app, buttonY);
    }


    constructor(app: PIXI.Application) {
        super();
        this.addDealer(app);
        this.addPlayer(app);
        this.createChipTray(app);
        this.createPopUp(app)
        this.createHUD();
        this.betSpotCell(app);
        this.addBetText();
        this.createBtn(app)
        this.disableActionButtons();
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

    renderPlacedBet(amount: number) {
        const chip = new Chip(amount)
        chip.scale.set(0)

        const stackOffset = this.betContainer.children.length * 4

        chip.x = 0
        chip.y = -stackOffset

        this.betContainer.addChild(chip)

        gsap.to(chip.scale, {
            x: 0.8,
            y: 0.8,
            duration: 0.25,
            ease: 'back.out(1.7)'
        })
    }

    addBetText() {
        const betLabel = new PIXI.Text('BET', {
            fill: '#ffffff',
            fontSize: 24,
            fontWeight: 'bold',
        })

        betLabel.anchor.set(0.5)
        betLabel.x = this.betSpot.x
        betLabel.y = this.betSpot.y + 95
        this.addChild(betLabel)
    }

    betSpotCell(app: any) {
        this.betSpot = new PIXI.Graphics();
        this.betSpot
            .circle(0, 0, 45)
            .stroke({
                width: 4,
                color: 0xff0000
            })
            .fill(0x111111);

        this.betSpot.x = app.screen.width / 2;
        this.betSpot.y = app.screen.height - 250;
        this.addChild(this.betSpot);

        this.betContainer.x = this.betSpot.x;
        this.betContainer.y = this.betSpot.y;
        this.addChild(this.betContainer);

        // gsap.to(this.betSpot.scale, {
        //     x: 1.05,
        //     y: 1.05,
        //     duration: 1,
        //     repeat: -1,
        //     yoyo: true,
        // })
    }
}