export class DeckManager {
    private deck: string[] = []

    constructor() {
        this.createDeck()
        this.shuffle()
    }

    createDeck() {
        this.deck = [
            'spade_1',
            'spade_2',
            'spade_3',
            'spade_4',
            'spade_5',
            'spade_6',
            'spade_7',
            'spade_8',
            'spade_9',
            'spade_10',
            'spade_jack',
            'spade_queen',
            'spade_king',
        ]
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
        }
    }

    drawCard(): string {
        if (this.deck.length === 0) {
            this.createDeck()
            this.shuffle()
        }

        return this.deck.pop() || 'BACK'
    }
}