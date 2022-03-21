import { CardEffect } from "@common/typings/card";

const CARD_EFFECT_ICON_REVEAL = "sunny";

export function getCardEffectIcon(cardEffect: CardEffect): string {
  switch (cardEffect) {
    case CardEffect.REVEAL:
      return CARD_EFFECT_ICON_REVEAL;
    default:
      return "Unknown card effect";
  }
}
