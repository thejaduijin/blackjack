export class BetManager {
  balance = 5000
  currentBet = 0
  history: number[] = []

  placeBet(amount: number) {
    if (this.balance >= amount) {
      this.balance -= amount
      this.currentBet += amount
      this.history.push(amount)
    }
  }

  clearBet() {
    this.balance += this.currentBet
    this.currentBet = 0
    this.history = []
  }

  undoBet() {
    const last = this.history.pop()

    if (!last) return

    this.balance += last
    this.currentBet -= last
  }

  doubleBet() {
    this.placeBet(this.currentBet)
  }

  // In-game Double Down: deducts currentBet from balance once more
  doubleDown(): boolean {
    if (this.balance >= this.currentBet) {
      this.balance -= this.currentBet
      this.currentBet *= 2
      return true  // success
    }
    return false  // not enough balance
  }
}