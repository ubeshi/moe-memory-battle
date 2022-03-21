import { CardEffect } from "@common/typings/card";

const CARD_EFFECT_NAME_REVEAL = "Flip a card face up, then flip it face down.";

export function getCardEffectDescription(cardEffect: CardEffect): string {
  switch (cardEffect) {
    case CardEffect.REVEAL:
      return CARD_EFFECT_NAME_REVEAL;
    default:
      return "Unknown card effect";
  }
}
