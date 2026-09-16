import { AiPlayerInstance, CardAbilityToActivate } from "@common/typings/ai";
import { MemoryGame, PlayerId, PlayerSlot } from "@common/typings/memory-game";
import { CardTarget } from "../services/card-targeting/card-targeting.service";
import { CardFace, CardFieldSlot, FieldSlotType } from "@common/typings/card";
import { MemoryGameService } from "../services/memory-game/memory-game.service";
import { AiMemoryService, RevealedFieldCardSlot } from "../services/ai-memory/ai-memory.service";
import { filter } from "rxjs/operators";

export class BasicMemoryAiPlayerInstance implements AiPlayerInstance {
  private readonly memoryGameService = MemoryGameService.getInstance();
  private readonly aiMemoryService = AiMemoryService.getInstance();

  private readonly revealedFieldCardSlotsMemory: RevealedFieldCardSlot[] = [];

  private readonly revealedFieldCardSlotSubscription = this.aiMemoryService.getRevealedFieldCardSlot$().pipe(
    filter((revealedFieldCardSlot) => revealedFieldCardSlot.playerIds.includes(this.playerId)),
    filter((revealedFieldCardSlot) => {
      return !this.revealedFieldCardSlotsMemory.some((revealedFieldCardSlotMemory) => {
        const isCardNameEqual = revealedFieldCardSlot.card.name === revealedFieldCardSlotMemory.card.name;
        const isPositionEqual = revealedFieldCardSlot.position === revealedFieldCardSlotMemory.position;
        return isCardNameEqual && isPositionEqual;
      });
    }),
  ).subscribe((revealedFieldCardSlot) => {
    this.revealedFieldCardSlotsMemory.push(revealedFieldCardSlot);
    this.getMemoryAfterForgettingCards(this.memoryGame, this.revealedFieldCardSlotsMemory, this.maximumFaceDownMemorySize);
  });

  constructor(private playerId: PlayerId, private memoryGame: MemoryGame, private maximumFaceDownMemorySize: number) {

  }

  destroy(): void {
    this.revealedFieldCardSlotSubscription.unsubscribe();
  }

  getCardAbilityToActivate(_memoryGame: MemoryGame): CardAbilityToActivate | undefined {
    return undefined;
  }

  getCardAbilityCardTargets(_memoryGame: MemoryGame): CardTarget[] {
    return [];
  }

  getCardAbilityPlayerTargets(_memoryGame: MemoryGame): PlayerSlot[] {
    return [];
  }

  getFlipPhaseOneGuessCardSlot(memoryGame: MemoryGame): CardFieldSlot {
    const guessableCardSlots = this.memoryGameService.getGuessableCardSlots(memoryGame);

    const pairsInMemory = this.getPairsInMemory(this.revealedFieldCardSlotsMemory);
    if (pairsInMemory.length > 0) {
      const pairInMemory = pairsInMemory[0];
      const { position } = pairInMemory[0];
      const fieldSlot = memoryGame.field.slots[position];
      if (fieldSlot.type === FieldSlotType.CARD && guessableCardSlots.includes(fieldSlot)) {
        return fieldSlot;
      }
    }

    return guessableCardSlots[Math.floor(Math.random() * guessableCardSlots.length)];
  }

  getFlipPhaseTwoGuessCardSlot(memoryGame: MemoryGame): CardFieldSlot {
    const guessableCardSlots = this.memoryGameService.getGuessableCardSlots(memoryGame);
    const guessableCardSlotsWithPosition = guessableCardSlots.map((guessableCardSlot) => {
      return {
        guessableCardSlot,
        position: memoryGame.field.slots.indexOf(guessableCardSlot),
      };
    });

    const guessableCardSlotsInMemory = guessableCardSlotsWithPosition.filter(({ guessableCardSlot, position }) => {
      return this.revealedFieldCardSlotsMemory.some((revealedFieldCardSlot) => {
        const isCardNameEqual = revealedFieldCardSlot.card.name === guessableCardSlot.cardSlot.card.name;
        const isPositionEqual = revealedFieldCardSlot.position === position;
        return isCardNameEqual && isPositionEqual;
      });
    });

    const flipPhaseOneGuesses = memoryGame.turns[memoryGame.currentTurnIndex].flipPhaseOneGuesses;

    const matchingCardSlots = guessableCardSlotsInMemory.filter(({ guessableCardSlot }) => {
      return flipPhaseOneGuesses.some((flipPhaseOneGuess) => {
        return flipPhaseOneGuess.cardSlot.card.name === guessableCardSlot.cardSlot.card.name;
      });
    });

    if (matchingCardSlots.length > 0) {
      return matchingCardSlots[0].guessableCardSlot;
    }

    return guessableCardSlots[Math.floor(Math.random() * guessableCardSlots.length)];
  }

  getPairsInMemory(revealedFieldCardSlotsMemory: RevealedFieldCardSlot[]): [RevealedFieldCardSlot, RevealedFieldCardSlot][] {
    const cardNames = revealedFieldCardSlotsMemory.map((revealedFieldCardSlot) => revealedFieldCardSlot.card.name);
    const uniqueCardNames = cardNames.filter((cardName, index, self) => self.indexOf(cardName) === index);
    const revealedCardsByName = uniqueCardNames.map((uniqueCardName) => {
      return revealedFieldCardSlotsMemory.filter((revealedFieldCardSlot) => revealedFieldCardSlot.card.name === uniqueCardName);
    });
    const pairsInMemory = revealedCardsByName.filter((revealedCards): revealedCards is [RevealedFieldCardSlot, RevealedFieldCardSlot] => revealedCards.length === 2);

    return pairsInMemory;
  }

  getMemoryAfterForgettingCards(memoryGame: MemoryGame, memory: RevealedFieldCardSlot[], maximumFaceDownMemorySize: number): RevealedFieldCardSlot[] {
    const faceUpCardsInMemory = memory.filter((revealedFieldCardSlot) => {
      const cardSlot = memoryGame.field.slots[revealedFieldCardSlot.position];
      return cardSlot.type === FieldSlotType.CARD && cardSlot.cardSlot.shownFace === CardFace.FRONT;
    });

    const faceDownCardsInMemory = memory.filter((revealedFieldCardSlot) => {
      const cardSlot = memoryGame.field.slots[revealedFieldCardSlot.position];
      return cardSlot.type === FieldSlotType.CARD && cardSlot.cardSlot.shownFace === CardFace.BACK;
    });

    while (faceDownCardsInMemory.length > maximumFaceDownMemorySize) {
      // TODO forget cards based on turns since last seen
      const randomIndex = Math.floor(Math.random() * faceDownCardsInMemory.length);
      faceDownCardsInMemory.splice(randomIndex, 1);
    }

    return [...faceUpCardsInMemory, ...faceDownCardsInMemory];
  }
}
