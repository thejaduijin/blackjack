export class BetManager {
  balance = 5000
  currentBet = 0
  history: number[] = []
  insuranceBet = 0
  splitBet = 0

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

  // Place insurance bet (fixed at half current bet)
  placeInsurance(): boolean {
    const amount = Math.floor(this.currentBet / 2)
    if (amount <= 0 || this.balance < amount) return false
    this.balance -= amount
    this.insuranceBet = amount
    return true
  }

  // Dealer has BJ → insurance pays 2:1
  resolveInsuranceWin() {
    this.balance += this.insuranceBet * 3  // stake back + 2:1 profit
    this.insuranceBet = 0
  }

  // Dealer has no BJ → insurance lost
  resolveInsuranceLoss() {
    this.insuranceBet = 0  // already deducted at placement
  }
  
  // Place split bet — equal to current bet
  placeSplitBet(): boolean {
    if (this.balance >= this.currentBet) {
      this.balance -= this.currentBet
      this.splitBet = this.currentBet
      return true
    }
    return false
  }

  resetSplitBet() {
    this.splitBet = 0
  }
}