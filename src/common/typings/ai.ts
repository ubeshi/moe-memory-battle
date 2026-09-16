import { CardTarget } from "@client/app/services/card-targeting/card-targeting.service";
import { Card, CardFieldSlot } from "./card";
import { MemoryGame, PlayerSlot } from "./memory-game";

export interface AiPlayerInstance {
  getCardAbilityToActivate(memoryGame: MemoryGame): CardAbilityToActivate | undefined;
  getCardAbilityCardTargets(memoryGame: MemoryGame): CardTarget[];
  getCardAbilityPlayerTargets(memoryGame: MemoryGame): PlayerSlot[];
  getFlipPhaseOneGuessCardSlot(memoryGame: MemoryGame): CardFieldSlot;
  getFlipPhaseTwoGuessCardSlot(memoryGame: MemoryGame): CardFieldSlot;
}

export interface CardAbilityToActivate {
  card: Card;
  abilityIndex: number;
}
