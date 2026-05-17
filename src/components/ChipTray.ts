import * as PIXI from 'pixi.js'
import { Chip } from './Chip'
import gsap from 'gsap';

export class ChipTray extends PIXI.Container {
  selectedChip: number = 1;
  chipMap = new Map<number, Chip>();

  constructor(onBet: (amount: number) => void) {
    super();
    const chips = [1, 5, 10, 25, 50, 100];

    chips.forEach((amount, index) => {
      const chip = new Chip(amount);
      chip.x = index * 90;

      this.chipMap.set(amount, chip);

      chip.on('pointertap', () => {
        this.selectChip(amount);
        onBet(amount);
      })
      this.addChild(chip);
    })

    this.selectChip(1);
  }


  selectChip(amount: number) {
    this.selectedChip = amount;

    this.chipMap.forEach(chip => {
      gsap.killTweensOf(chip.scale);
      gsap.to(chip.scale, {
        x: 0.8,
        y: 0.8,
        duration: 0.25,
        ease: 'power2.out'
      })

      gsap.to(chip, {
        alpha: 0.7,
        duration: 0.25
      })
    })

    const active = this.chipMap.get(amount);
    if (active) {
      gsap.to(active.scale, {
        x: 1.2,
        y: 1.2,
        duration: 0.25,
        ease: 'back.out(1.7)',
        onComplete: () => {
          gsap.to(active.scale, {
            x: 1.05,
            y: 1.05,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          })
        }
      })

      gsap.to(active, {
        alpha: 1,
        duration: 0.25
      })
    }
  }
}

