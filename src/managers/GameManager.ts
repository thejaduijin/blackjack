import { DeckManager } from './DeckManager'
import { calculateHand, isBlackjack, isBusted } from '../utils/BlackjackUtils'

export class GameManager {
  deck = new DeckManager()

  playerCards: string[] = []
  dealerCards: string[] = []

  startRound() {
    this.playerCards = []
    this.dealerCards = []

    this.playerCards.push(this.deck.drawCard())
    this.dealerCards.push(this.deck.drawCard())

    this.playerCards.push(this.deck.drawCard())
    this.dealerCards.push(this.deck.drawCard())
  }

  hitPlayer() {
    this.playerCards.push(this.deck.drawCard())
  }

  hitDealer() {
    this.dealerCards.push(this.deck.drawCard())
  }

  getPlayerTotal() {
    return calculateHand(this.playerCards)
  }

  getDealerTotal() {
    return calculateHand(this.dealerCards)
  }

  playerBlackjack() {
    return isBlackjack(this.playerCards)
  }

  dealerBlackjack() {
    return isBlackjack(this.dealerCards)
  }

  playerBusted() {
    return isBusted(this.playerCards)
  }

  dealerBusted() {
    return isBusted(this.dealerCards)
  }
}