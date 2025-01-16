import { Card, CardEffectStepType, CardTargetCardType, CardZoneType, SetCardShownFaceType } from "@common/typings/card";
import { exhaustSelf } from "./common";

export const revealCard: Card = {
  imageUrl: "",
  abilities: [
    {
      description: "Exhaust this card. Flip target card on the field face up.",
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
            targetTypes: [CardTargetCardType.ANY],
            quantity: 1,
            saveTargetCardsToKey: "revealedCard",
          },
          {
            type: CardEffectStepType.SET_CARD_SHOWN_FACE,
            shownFace: SetCardShownFaceType.FRONT,
            getTargetCardsFromKey: "revealedCard",
          },
        ],
      },
    },
  ],
};
