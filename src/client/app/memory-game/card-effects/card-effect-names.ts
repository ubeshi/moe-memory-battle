import { CardEffect } from "@common/typings/card";

const CARD_EFFECT_NAME_REVEAL = "Reveal";

export function getCardEffectName(cardEffect: CardEffect): string {
  switch (cardEffect) {
    case CardEffect.REVEAL:
      return CARD_EFFECT_NAME_REVEAL;
    default:
      return "Unknown card effect";
  }
}