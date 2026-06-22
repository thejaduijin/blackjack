// import { DeckManager } from './DeckManager'
// import { calculateHand, isBlackjack, isBusted } from '../utils/BlackjackUtils'

// export class GameManager {
//   deck = new DeckManager()

//   playerCards: string[] = []
//   dealerCards: string[] = []

//   startRound() {
//     this.playerCards = []
//     this.dealerCards = []

//     this.playerCards.push(this.deck.drawCard())
//     this.dealerCards.push(this.deck.drawCard())

//     this.playerCards.push(this.deck.drawCard())
//     this.dealerCards.push(this.deck.drawCard())
//   }

//   hitPlayer() {
//     this.playerCards.push(this.deck.drawCard())
//   }

//   hitDealer() {
//     this.dealerCards.push(this.deck.drawCard())
//   }

//   getPlayerTotal() {
//     return calculateHand(this.playerCards)
//   }

//   getDealerTotal() {
//     return calculateHand(this.dealerCards)
//   }

//   playerBlackjack() {
//     return isBlackjack(this.playerCards)
//   }

//   dealerBlackjack() {
//     return isBlackjack(this.dealerCards)
//   }

//   playerBusted() {
//     return isBusted(this.playerCards)
//   }

//   dealerBusted() {
//     return isBusted(this.dealerCards)
//   }
// }


import { DeckManager } from './DeckManager'
import { calculateHand, isBlackjack, isBusted } from '../utils/BlackjackUtils'

export class GameManager {
  deck = new DeckManager()

  playerCards: string[] = []
  dealerCards: string[] = []

  // Split state
  isSplit = false
  splitHands: string[][] = [[], []]
  activeHandIndex = 0

  startRound() {
    this.playerCards = []
    this.dealerCards = []
    this.isSplit = false
    this.splitHands = [[], []]
    this.activeHandIndex = 0

    this.playerCards.push(this.deck.drawCard())
    this.dealerCards.push(this.deck.drawCard())
    this.playerCards.push(this.deck.drawCard())
    this.dealerCards.push(this.deck.drawCard())
  }

  hitPlayer() {
    if (this.isSplit) {
      this.splitHands[this.activeHandIndex].push(this.deck.drawCard())
    } else {
      this.playerCards.push(this.deck.drawCard())
    }
  }

  hitDealer() {
    this.dealerCards.push(this.deck.drawCard())
  }

  getPlayerTotal(): number {
    if (this.isSplit) {
      return calculateHand(this.splitHands[this.activeHandIndex])
    }
    return calculateHand(this.playerCards)
  }

  getDealerTotal(): number {
    return calculateHand(this.dealerCards)
  }

  getHandTotal(handIndex: number): number {
    return calculateHand(this.splitHands[handIndex])
  }

  playerBlackjack(): boolean {
    return isBlackjack(this.playerCards)
  }

  dealerBlackjack(): boolean {
    return isBlackjack(this.dealerCards)
  }

  playerBusted(): boolean {
    if (this.isSplit) {
      return isBusted(this.splitHands[this.activeHandIndex])
    }
    return isBusted(this.playerCards)
  }

  dealerBusted(): boolean {
    return isBusted(this.dealerCards)
  }

  // Split eligibility — equal rank on first two cards
  canSplit(): boolean {
    if (this.playerCards.length !== 2) return false
    const rank0 = this.playerCards[0].split('_')[1]
    const rank1 = this.playerCards[1].split('_')[1]
    return rank0 === rank1
  }

  // Execute split — separate into two hands, deal one card each
  executeSplit() {
    this.isSplit = true
    this.activeHandIndex = 0
    this.splitHands[0] = [this.playerCards[0], this.deck.drawCard()]
    this.splitHands[1] = [this.playerCards[1], this.deck.drawCard()]
    this.playerCards = []
  }

  // Check if split was on Aces
  isSplitAces(): boolean {
    if (!this.isSplit) return false
    return this.splitHands[0][0].split('_')[1] === '1'
  }

  // Move to next split hand
  nextHand(): boolean {
    if (this.activeHandIndex === 0) {
      this.activeHandIndex = 1
      return true  // switched to hand 1
    }
    return false  // no more hands
  }

  isLastHand(): boolean {
    return this.activeHandIndex === 1
  }
}