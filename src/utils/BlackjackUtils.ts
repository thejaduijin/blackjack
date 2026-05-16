export function calculateHand(cards: string[]): number {
  let total = 0
  let aces = 0

  for (const card of cards) {
    if (card.includes('jack')) {
      total += 10
    } else if (card.includes('queen')) {
      total += 10
    } else if (card.includes('king')) {
      total += 10
    } else if (card.includes('1')) {
      aces++
      total += 11
    } else {
      const value = Number(card.split('_')[1])

      total += value
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }

  return total
}

export function isBlackjack(cards: string[]): boolean {
  return cards.length === 2 && calculateHand(cards) === 21
}

export function isBusted(cards: string[]): boolean {
  return calculateHand(cards) > 21
}