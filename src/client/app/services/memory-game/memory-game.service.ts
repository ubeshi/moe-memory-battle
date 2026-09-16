import { inject, Injectable } from "@angular/core";
import { CardFace, CardFieldSlot, CardZoneType, EmptyFieldSlot, Field, FieldSlotType } from "@common/typings/card";
import { UtilitiesService } from "../utilities/utilities.service";
import { MemoryGame, PlayerId, PlayerZones, Turn, TurnPhaseType } from "@common/typings/memory-game";
import { Deck } from "@common/typings/deck";
import { CardService } from "../card/card.service";

@Injectable({
  providedIn: "root",
})
export class MemoryGameService {
  private readonly utilitiesService = inject(UtilitiesService);
  private readonly cardService = inject(CardService);

  private static readonly FIELD_SIZE = 32;
  private static instance: MemoryGameService;

  static getInstance(): MemoryGameService {
    return MemoryGameService.instance;
  }

  constructor() {
    if (!MemoryGameService.instance) {
      MemoryGameService.instance = this;
    }
  }

  public getEmptyField(): Field {
    return {
      slots: this.utilitiesService
        .getRange(0, MemoryGameService.FIELD_SIZE)
        .map(() => this.getEmptyFieldSlot()),
    };
  }

  public getEmptyFieldSlot(): EmptyFieldSlot {
    return {
      type: FieldSlotType.EMPTY,
    };
  }

  public getDefaultTurn(playerId: PlayerId): Turn {
    return {
      playerId,
      phases: [
        { type: TurnPhaseType.PLAY_CARD_PHASE },
        { type: TurnPhaseType.FLIP_PHASE_ONE },
        { type: TurnPhaseType.FLIP_PHASE_TWO },
        { type: TurnPhaseType.END_PHASE },
      ],
      flipPhaseOneGuesses: [],
      flipPhaseTwoGuesses: [],
    };
  }

  public getPlayerZones(): PlayerZones {
    return {
      [CardZoneType.HAND]: { cards: [] },
      [CardZoneType.ACTIVATION]: { cards: [] },
      [CardZoneType.EXHAUST]: { cards: [] },
      [CardZoneType.DISCARD]: { cards: [] },
      [CardZoneType.MATCH]: { cards: [] },
    };
  }

  public getInitialField(decks: Deck[]): Field {
    const fieldCards = decks
      .flatMap((deck) => deck.fieldCards)
      .flatMap((card) => [card, this.cardService.getCardCopy(card)])
      .splice(0, MemoryGameService.FIELD_SIZE);
    const shuffledFieldCards = this.utilitiesService.shuffleArray(fieldCards);

    const cardFieldShots = shuffledFieldCards.map((card) => ({
      type: FieldSlotType.CARD,
      cardSlot: {
        card,
        shownFace: CardFace.BACK,
      },
    }));
    return { slots: cardFieldShots };
  }

  public getGuessableCardSlots(memoryGame: MemoryGame): CardFieldSlot[] {
    const turn = memoryGame.turns[memoryGame.currentTurnIndex];
    const allCardSlots = memoryGame.field.slots.filter((slot): slot is CardFieldSlot => slot.type === FieldSlotType.CARD);
    const guessedCardSlots = [...turn.flipPhaseOneGuesses, ...turn.flipPhaseTwoGuesses];
    return allCardSlots.filter((slot) => !guessedCardSlots.includes(slot));
  }
}
