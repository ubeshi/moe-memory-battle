import { Card, CardEffectStepType, CardTargetCardType, CardZoneType, FieldCardEffectShape, SetCardShownFaceType } from "@common/typings/card";
import { exhaustSelf } from "./common";

export const shineCard: Card = {
  imageUrl: "",
  name: "Shine",
  abilities: [
    {
      name: "Shine",
      description: "Exhaust this card. Target card on the field and adjacent cards are flipped face up, then flipped face down.",
      costOptions: [
        {
          costs: [
            exhaustSelf,
          ],
        },
      ],
      effect: {
        steps: [
          {
            type: CardEffectStepType.SELECT_CARD_TARGETS,
            zone: CardZoneType.FIELD,
            zoneOwnerTypes: [],
            targetTypes: [CardTargetCardType.ANY],
            effectShape: FieldCardEffectShape.CROSS_SIZE_ONE,
            quantity: 1,
            saveTargetCardsToKey: "shinedCards",
          },
          {
            type: CardEffectStepType.SET_CARD_SHOWN_FACE,
            shownFace: SetCardShownFaceType.FRONT,
            getTargetCardsFromKey: "shinedCards",
          },
          {
            type: CardEffectStepType.WAIT_FOR_PLAYERS_CONFIRM,
          },
          {
            type: CardEffectStepType.SET_CARD_SHOWN_FACE,
            shownFace: SetCardShownFaceType.BACK,
            getTargetCardsFromKey: "shinedCards",
          },
          {
            type: CardEffectStepType.CLEAR_CARD_TARGETS,
            clearTargetCardsFromKey: "shinedCards",
          },
        ],
      },
    },
  ],
};
