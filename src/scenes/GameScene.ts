import * as PIXI from 'pixi.js'

import { Dealer } from '../components/Dealer'
import { ChipTray } from '../components/ChipTray'
import { HUD } from '../components/HUD'
import { GameManager } from '../managers/GameManager'
import { BetManager } from '../managers/BetManager'
import { Card } from '../components/Card'
import { ResultPopup } from '../components/ResultPopup'
import { Chip } from '../components/Chip'
// import gsap from 'gsap'
import { IconButton } from '../components/IconButton'
import { InsurancePopup } from '../components/InsurancePopup'
import { HandDisplay } from '../components/HandDisplay'
import { calculateHand } from '../utils/BlackjackUtils'

export class GameScene extends PIXI.Container {
    gameManager = new GameManager()
    betManager = new BetManager()
    showDealerCards = false
    isFirstAction = false
    newGameBtn!: IconButton
    clearBtn!: IconButton
    undoBtn!: IconButton
    doubleBtn!: IconButton
    dealBtn!: IconButton
    hitBtn!: IconButton
    standBtn!: IconButton
    chipTray!: ChipTray
    splitBtn!: IconButton

    betSpot!: PIXI.Graphics

    dealer = new Dealer()
    hud = new HUD()
    popup = new ResultPopup()

    playerContainer = new PIXI.Container()
    dealerContainer = new PIXI.Container()
    betContainer = new PIXI.Container()
    insurancePopup = new InsurancePopup()

    handDisplay0 = new HandDisplay()   // main hand (or left split hand)
    handDisplay1 = new HandDisplay()   // right split hand (hidden when not split)
    dealerHandDisplay = new HandDisplay()

    refreshHUD() {
        this.hud.update(
            this.betManager.balance,
            this.betManager.currentBet
        )
    }

    enableHand() {
        this.dealerHandDisplay.visible = true;
        this.handDisplay0.visible = true;
        this.handDisplay1.visible = true;
    }

    startGame() {
        this.disableBettingControls();
        this.enableActionButtons();
        this.enableHand();

        this.playerContainer.removeChildren()
        this.dealerContainer.removeChildren()
        this.showDealerCards = false
        this.gameManager.startRound()
        this.dealer.playDealAnimation()

        this.renderHands()

        const playerBJ = this.gameManager.playerBlackjack()
        const dealerBJ = this.gameManager.dealerBlackjack()

        // Both have blackjack → Push
        if (playerBJ && dealerBJ) {
            this.showDealerCards = true
            this.renderHands()
            this.betManager.balance += this.betManager.currentBet  // return bet only
            this.popup.show('PUSH!')
            this.betManager.currentBet = 0
            this.refreshHUD()
            this.newGameBtn.visible = true
            this.disableGameplayButtons()
            return
        }

        // Player has blackjack, dealer doesn't → Player wins 3:2
        if (playerBJ) {
            this.betManager.balance += this.betManager.currentBet * 2.5
            this.popup.show('BLACKJACK!')
            this.betManager.currentBet = 0
            this.refreshHUD()
            this.newGameBtn.visible = true
            this.disableGameplayButtons()
            return
        }

        // Dealer has blackjack, player doesn't → Dealer wins, reveal cards
        if (dealerBJ) {
            this.showDealerCards = true
            this.renderHands()
            this.popup.show('DEALER BLACKJACK!')
            this.betManager.currentBet = 0
            this.refreshHUD()
            this.newGameBtn.visible = true
            this.disableGameplayButtons()
            return
        }

        // Normal round continues — player acts
        this.isFirstAction = true
        this.updateActionButtons()

        // Dealer upcard is index 0
        const dealerUpcard = this.gameManager.dealerCards[0]
        const isAce = dealerUpcard.split('_')[1] === '1'

        if (isAce) {
            this.offerInsurance()
            return
        }
    }

    offerInsurance() {
        const insuranceAmount = Math.floor(this.betManager.currentBet / 2)

        // Skip insurance popup if bet is too small (e.g. $1)
        if (insuranceAmount === 0) {
            this.enableActionButtons()
            this.updateActionButtons()
            return
        }

        // Disable player actions while popup is open
        this.disableActionButtons()

        this.insurancePopup.show(
            insuranceAmount,

            // onYes
            () => {
                const success = this.betManager.placeInsurance()
                if (!success) {
                    this.popup.show('NOT ENOUGH BALANCE!')
                }
                this.refreshHUD()
                this.enableActionButtons()
                this.updateActionButtons()
            },

            // onNo
            () => {
                this.enableActionButtons()
                this.updateActionButtons()
            }
        )
    }

    // hitPlayer() {
    //     this.isFirstAction = false
    //     this.updateActionButtons()
    //     this.gameManager.hitPlayer()
    //     this.renderHands()

    //     if (this.gameManager.playerBusted()) {
    //         console.log('PLAYER BUSTED')
    //         this.popup.show('BUSTED!')
    //         this.betManager.currentBet = 0
    //         this.refreshHUD()
    //         this.newGameBtn.visible = true
    //         this.disableGameplayButtons()
    //     }
    // }

    hitPlayer() {
        this.isFirstAction = false
        this.updateActionButtons()
        this.gameManager.hitPlayer()
        this.renderHands()

        if (this.gameManager.playerBusted()) {
            if (this.gameManager.isSplit && !this.gameManager.isLastHand()) {
                // Hand 0 busted — move to hand 1
                this.popup.show('BUSTED! NEXT HAND')
                this.gameManager.nextHand()
                this.isFirstAction = true
                setTimeout(() => {
                    this.popup.visible = false
                    this.renderHands()
                    this.updateActionButtons()
                }, 1000)
            } else {
                // Last hand or no split — end round
                this.popup.show('BUSTED!')
                this.betManager.currentBet = 0
                this.refreshHUD()
                this.newGameBtn.visible = true
                this.disableGameplayButtons()
            }
        }
    }

    // dealerTurn() {
    //     this.showDealerCards = true
    //     this.renderHands()

    //     // DEALER BLACKJACK CHECK HERE
    //     if (this.gameManager.dealerBlackjack()) {
    //         this.popup.show('DEALER BLACKJACK!');
    //         this.betManager.currentBet = 0;
    //         this.refreshHUD();
    //         this.newGameBtn.visible = true;
    //         this.disableGameplayButtons();
    //         return;
    //     }

    //     while (this.gameManager.getDealerTotal() < 17) {
    //         this.gameManager.hitDealer()
    //     }

    //     this.renderHands()
    //     this.checkWinner()
    // }

    dealerTurn() {
        // If split and on hand 0 — move to hand 1 first
        if (this.gameManager.isSplit && !this.gameManager.isLastHand()) {
            this.gameManager.nextHand()
            this.isFirstAction = true
            this.renderHands()
            this.updateActionButtons()
            return
        }

        // All hands done — dealer plays
        this.showDealerCards = true
        this.renderHands()

        while (this.gameManager.getDealerTotal() < 17) {
            this.gameManager.hitDealer()
        }

        this.renderHands()
        this.checkWinner()
    }

    // dealerTurn() {
    //     this.showDealerCards = true
    //     this.renderHands()

    //     // S17 rule: dealer stands on 17 or higher (including soft 17)
    //     while (this.gameManager.getDealerTotal() < 17) {
    //         this.gameManager.hitDealer()
    //     }

    //     this.renderHands()
    //     this.checkWinner()
    // }

    // checkWinner() {
    //     const player = this.gameManager.getPlayerTotal()
    //     const dealer = this.gameManager.getDealerTotal()
    //     const bet = this.betManager.currentBet

    //     // Resolve insurance if it was placed
    //     if (this.betManager.insuranceBet > 0) {
    //         if (this.gameManager.dealerBlackjack()) {
    //             this.betManager.resolveInsuranceWin()
    //         } else {
    //             this.betManager.resolveInsuranceLoss()
    //         }
    //     }

    //     if (dealer > 21) {
    //         this.betManager.balance += bet * 2
    //         this.popup.show('PLAYER WINS!')
    //     } else if (player > dealer) {
    //         this.betManager.balance += bet * 2
    //         this.popup.show('PLAYER WINS!')
    //     } else if (dealer > player) {
    //         this.popup.show('DEALER WINS!')
    //     } else {
    //         this.betManager.balance += bet
    //         this.popup.show('PUSH!')
    //     }

    //     this.betManager.currentBet = 0
    //     this.refreshHUD()
    //     this.newGameBtn.visible = true
    //     this.disableGameplayButtons()
    // }


    checkWinner() {
        const dealer = this.gameManager.getDealerTotal()

        // Resolve insurance
        if (this.betManager.insuranceBet > 0) {
            if (this.gameManager.dealerBlackjack()) {
                this.betManager.resolveInsuranceWin()
            } else {
                this.betManager.resolveInsuranceLoss()
            }
        }

        if (this.gameManager.isSplit) {
            let resultMsg = ''
            let totalWin = 0

            for (let i = 0; i < 2; i++) {
                const handTotal = this.gameManager.getHandTotal(i)
                const bet = i === 0 ? this.betManager.currentBet : this.betManager.splitBet
                const busted = handTotal > 21

                if (busted) {
                    resultMsg += `H${i + 1}: LOSE  `
                } else if (dealer > 21 || handTotal > dealer) {
                    totalWin += bet * 2
                    resultMsg += `H${i + 1}: WIN  `
                } else if (handTotal === dealer) {
                    totalWin += bet
                    resultMsg += `H${i + 1}: PUSH  `
                } else {
                    resultMsg += `H${i + 1}: LOSE  `
                }
            }

            this.betManager.balance += totalWin
            this.betManager.currentBet = 0
            this.betManager.resetSplitBet()
            this.popup.show(resultMsg.trim())

        } else {
            // Normal single hand resolution
            const player = this.gameManager.getPlayerTotal()
            const bet = this.betManager.currentBet

            if (dealer > 21 || player > dealer) {
                this.betManager.balance += bet * 2
                this.popup.show('PLAYER WINS!')
            } else if (dealer > player) {
                this.popup.show('DEALER WINS!')
            } else {
                this.betManager.balance += bet
                this.popup.show('PUSH!')
            }

            this.betManager.currentBet = 0
        }

        this.refreshHUD()
        this.newGameBtn.visible = true
        this.disableGameplayButtons()
    }

    // checkWinner() {
    //     const player = this.gameManager.getPlayerTotal()
    //     const dealer = this.gameManager.getDealerTotal()

    //     const bet = this.betManager.currentBet

    //     if (dealer > 21) {
    //         this.betManager.balance += bet * 2
    //         this.popup.show('PLAYER WINS!')
    //     } else if (player > dealer) {
    //         this.betManager.balance += bet * 2
    //         this.popup.show('PLAYER WINS!')
    //     } else if (dealer > player) {
    //         this.popup.show('DEALER WINS!')
    //     } else {
    //         this.betManager.balance += bet
    //         this.popup.show('PUSH!')
    //     }

    //     this.betManager.currentBet = 0

    //     this.refreshHUD()
    //     this.newGameBtn.visible = true
    //     this.disableGameplayButtons()
    // }

    renderHands() {
        this.playerContainer.removeChildren()
        this.dealerContainer.removeChildren()

        const visibleDealerCards = this.gameManager.dealerCards.map((value, index) => {
            if (index === 1 && !this.showDealerCards) return 'BACK'
            return value
        })

        visibleDealerCards.forEach((cardValue, index) => {
            const card = new Card(cardValue)
            card.x = index * 20
            card.y = index * 20
            this.dealerContainer.addChild(card)
        })
        const dealerTotal = this.showDealerCards
            ? this.gameManager.getDealerTotal()
            : calculateHand([this.gameManager.dealerCards[0]])  // upcard only

        this.dealerHandDisplay.render(
            visibleDealerCards,
            dealerTotal,
            0,      // no bet label for dealer
            false   // never "active" highlight for dealer
        )
        // Dealer cards — always use dealerContainer
        this.gameManager.dealerCards.forEach((value, index) => {
            let cardValue = value
            if (index === 1 && !this.showDealerCards) {
                cardValue = 'BACK'
            }
            const card = new Card(cardValue)
            card.x = index * 20
            card.y = index * 20
            this.dealerContainer.addChild(card)
        })

        // Player cards — ALWAYS use HandDisplay0 for normal play too
        if (this.gameManager.isSplit) {
            this.handDisplay0.visible = true
            this.handDisplay1.visible = true

            this.handDisplay0.render(
                this.gameManager.splitHands[0],
                this.gameManager.getHandTotal(0),
                this.betManager.currentBet,
                this.gameManager.activeHandIndex === 0
            )

            this.handDisplay1.render(
                this.gameManager.splitHands[1],
                this.gameManager.getHandTotal(1),
                this.betManager.splitBet,
                this.gameManager.activeHandIndex === 1
            )

        } else {
            // Normal play — use handDisplay0, hide handDisplay1
            this.handDisplay0.visible = true
            this.handDisplay1.visible = false

            this.handDisplay0.render(
                this.gameManager.playerCards,
                this.gameManager.getPlayerTotal(),
                this.betManager.currentBet,
                true  // always active in normal play
            )
        }
    }

    // renderHands() {
    //     this.playerContainer.removeChildren()
    //     this.dealerContainer.removeChildren()

    //     this.gameManager.playerCards.forEach((value, index) => {
    //         const card = new Card(value)
    //         card.x = index * 90
    //         this.playerContainer.addChild(card)
    //     })

    //     this.gameManager.dealerCards.forEach((value, index) => {
    //         let cardValue = value
    //         if (index === 1 && !this.showDealerCards) {
    //             cardValue = 'BACK'
    //         }
    //         const card = new Card(cardValue)
    //         card.x = index * 90
    //         this.dealerContainer.addChild(card)
    //     })
    // }

    // resetGame() {
    //     this.playerContainer.removeChildren()
    //     this.dealerContainer.removeChildren()

    //     this.gameManager.playerCards = []
    //     this.gameManager.dealerCards = []

    //     this.showDealerCards = false
    //     this.isFirstAction = false
    //     this.newGameBtn.visible = false
    //     this.popup.visible = false

    //     this.betManager.insuranceBet = 0
    //     this.insurancePopup.visible = false

    //     this.enableGameplayButtons();
    //     this.enableBettingControls();
    //     this.disableActionButtons()

    //     this.refreshHUD()

    //     this.betContainer.removeChildren();
    //     this.updateBetControls()
    // }

    disableHand() {
        this.dealerHandDisplay.visible = false;
        this.handDisplay0.visible = false;
        this.handDisplay1.visible = false;
    }

    resetGame() {
        this.playerContainer.removeChildren()
        this.dealerContainer.removeChildren()
        this.handDisplay0.clear()
        this.handDisplay1.clear()
        this.dealerHandDisplay.clear()
        this.handDisplay1.visible = false
        this.playerContainer.visible = true

        this.gameManager.playerCards = []
        this.gameManager.dealerCards = []
        this.gameManager.isSplit = false
        this.gameManager.splitHands = [[], []]
        this.gameManager.activeHandIndex = 0

        this.showDealerCards = false
        this.isFirstAction = false
        this.newGameBtn.visible = false
        this.popup.visible = false

        this.betManager.insuranceBet = 0
        this.betManager.resetSplitBet()
        this.insurancePopup.visible = false

        this.enableGameplayButtons()
        this.enableBettingControls()
        this.disableActionButtons()

        this.refreshHUD()
        this.betContainer.removeChildren()
        this.updateBetControls()

        this.disableHand();
    }

    // addDealer(app: PIXI.Application) {
    //     this.dealer.x = app.screen.width / 2
    //     this.dealer.y = 120
    //     this.addChild(this.dealer);

    //     this.dealerContainer.x = app.screen.width / 4;
    //     this.dealerContainer.y = app.screen.height / 3;
    //     this.addChild(this.dealerContainer)
    // }

    addDealer(app: PIXI.Application) {
        this.dealer.x = app.screen.width / 2
        this.dealer.y = 120
        this.addChild(this.dealer)

        // Keep dealerContainer for card sprites
        this.dealerContainer.x = app.screen.width / 4
        this.dealerContainer.y = app.screen.height / 3
        this.addChild(this.dealerContainer)

        // Dealer HandDisplay — same position as dealerContainer
        this.dealerHandDisplay.x = app.screen.width / 4
        this.dealerHandDisplay.y = app.screen.height / 3
        this.dealerHandDisplay.visible = false;
        this.addChild(this.dealerHandDisplay)
    }

    createHUD() {
        this.hud.x = 20
        this.hud.y = 20
        this.addChild(this.hud)
    }

    // addPlayer(app: PIXI.Application) {
    //     this.playerContainer.x = (app.screen.width / 2) + 200;
    //     this.playerContainer.y = app.screen.height / 3;
    //     this.addChild(this.playerContainer)
    // }

    addPlayer(app: PIXI.Application) {
        // Hand 0 — main player hand position (right side)
        this.handDisplay0.x = app.screen.width / 2 + 100
        this.handDisplay0.y = app.screen.height / 3
        this.handDisplay0.visible = false;
        this.addChild(this.handDisplay0)

        // Hand 1 — split second hand (further right), hidden until split
        this.handDisplay1.x = app.screen.width / 2 + 350
        this.handDisplay1.y = app.screen.height / 3
        this.handDisplay1.visible = false
        this.addChild(this.handDisplay1)
    }

    splitButton(app: any, yPos: number) {
        this.splitBtn = new IconButton('btn_split', 'SPLIT', 48, 48, () => {
            this.handleSplit()
        })
        this.splitBtn.position.set(app.screen.width - 230, yPos)
        this.addChild(this.splitBtn)
    }

    handleSplit() {
        if (!this.isFirstAction) return
        if (!this.gameManager.canSplit()) return

        const success = this.betManager.placeSplitBet()
        if (!success) {
            this.popup.show('NOT ENOUGH BALANCE!')
            return
        }

        this.gameManager.executeSplit()
        this.isFirstAction = true  // first action resets for new hand
        this.renderHands()
        this.refreshHUD()

        // Split Aces — one card each, auto-stand both
        if (this.gameManager.isSplitAces()) {
            this.popup.show('SPLIT ACES — ONE CARD EACH')
            this.disableActionButtons()
            setTimeout(() => this.dealerTurn(), 1500)
            return
        }

        this.updateActionButtons()
        this.splitBtn.setDisabled(true)  // no resplit
    }

    createChipTray(app: PIXI.Application) {
        this.chipTray = new ChipTray((amount) => {
            this.betManager.placeBet(amount)
            this.renderPlacedBet()
            this.refreshHUD();
            this.updateBetControls();
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
            this.refreshHUD();
            this.updateBetControls();
        })
        this.clearBtn.position.set(40, yPos)
        this.addChild(this.clearBtn)
    }

    undoButton(yPos: number) {
        this.undoBtn = new IconButton('btn_undo', 'UNDO', 48, 48, () => {
            this.betManager.undoBet()
            if (this.betContainer.children.length > 0) {
                this.betContainer.removeChildAt(this.betContainer.children.length - 1);
            }
            this.refreshHUD();
            this.updateBetControls();
        })
        this.undoBtn.position.set(130, yPos)
        this.addChild(this.undoBtn)
    }

    doubleButton(yPos: number) {
        this.doubleBtn = new IconButton('btn_double', 'DOUBLE', 48, 48, () => {
            this.handleDoubleDown()
            // this.betManager.doubleBet();
            // this.refreshHUD();
            // this.updateBetControls();
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
            app.screen.width - 340,
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
        this.splitButton(app, buttonY)
    }


    constructor(app: PIXI.Application) {
        super();
        this.addDealer(app);
        this.addPlayer(app);
        this.createChipTray(app);
        this.createHUD();
        this.betSpotCell(app);
        this.addBetText();
        this.createBtn(app)
        this.disableActionButtons();
        this.updateBetControls();
        this.createPopUp(app)
        this.createInsurancePopup(app)
    }

    createInsurancePopup(app: PIXI.Application) {
        this.insurancePopup.x = app.screen.width / 2
        this.insurancePopup.y = app.screen.height / 2
        this.addChild(this.insurancePopup)
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
        if (!this.hitBtn || !this.standBtn || !this.splitBtn) return
        this.hitBtn.eventMode = 'none'
        this.standBtn.eventMode = 'none'
        this.splitBtn.eventMode = 'none'
        this.hitBtn.alpha = 0.5
        this.standBtn.alpha = 0.5
        this.splitBtn.alpha = 0.5
    }

    enableActionButtons() {
        if (!this.hitBtn || !this.standBtn || !this.splitBtn) return
        this.hitBtn.eventMode = 'static'
        this.standBtn.eventMode = 'static'
        this.splitBtn.eventMode = 'static'
        this.hitBtn.alpha = 1
        this.standBtn.alpha = 1
        this.splitBtn.alpha = 1
    }

    renderPlacedBet() {
        this.renderBetChips(this.betManager.currentBet)
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
    }

    updateBetControls() {
        const hasBet = this.betManager.currentBet > 0;
        this.dealBtn.setDisabled(!hasBet);
        this.clearBtn.setDisabled(!hasBet);
        this.undoBtn.setDisabled(!hasBet);
        this.doubleBtn.setDisabled(!hasBet)
    }

    handleDoubleDown() {
        // In-game Double Down
        if (this.gameManager.playerCards.length > 0) {
            if (!this.isFirstAction) return

            const success = this.betManager.doubleDown()
            if (!success) {
                this.popup.show('NOT ENOUGH BALANCE!')
                return
            }

            this.isFirstAction = false
            this.refreshHUD()
            this.gameManager.hitPlayer()
            this.renderHands()

            if (this.gameManager.playerBusted()) {
                this.popup.show('BUSTED!')
                this.betManager.currentBet = 0
                this.refreshHUD()
                this.newGameBtn.visible = true
                this.disableGameplayButtons()
                return
            }

            this.dealerTurn()
            return
        }

        // Pre-deal: double the bet
        const currentBet = this.betManager.currentBet
        if (currentBet <= 0) return
        if (this.betManager.balance < currentBet) return

        this.betManager.doubleBet()
        this.renderBetChips(this.betManager.currentBet)  // re-render consolidated chips
        this.refreshHUD()
        this.updateBetControls()
    }

    updateActionButtons() {
        const canDouble = this.isFirstAction && this.betManager.balance >= this.betManager.currentBet
        const canSplit = this.isFirstAction && this.gameManager.canSplit() && !this.gameManager.isSplit

        this.doubleBtn.setDisabled(!canDouble)
        this.splitBtn.setDisabled(!canSplit)
    }

    renderBetChips(total: number) {
        this.betContainer.removeChildren()

        const denominations = [100, 50, 25, 10, 5, 1]
        const chips: number[] = []

        let remaining = total
        for (const denom of denominations) {
            while (remaining >= denom) {
                chips.push(denom)
                remaining -= denom
            }
        }

        // Render stack bottom to top with offset
        chips.forEach((denom, index) => {
            const chip = new Chip(denom)
            chip.scale.set(0.8)
            chip.x = 0
            chip.y = -(index * 6)  // stack upward
            this.betContainer.addChild(chip)
        })
    }
}