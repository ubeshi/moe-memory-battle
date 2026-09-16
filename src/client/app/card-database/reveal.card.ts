import { Card, CardEffectStepType, CardTargetCardType, CardZoneType, FieldCardEffectShape, SetCardShownFaceType } from "@common/typings/card";
import { exhaustSelf } from "./common";

export const revealCard: Card = {
  imageUrl: "",
  name: "Reveal",
  abilities: [
    {
      name: "Reveal",
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
            zoneOwnerTypes: [],
            targetTypes: [CardTargetCardType.ANY],
            effectShape: FieldCardEffectShape.SINGLE,
            quantity: 1,
            saveTargetCardsToKey: "revealedCard",
          },
          {
            type: CardEffectStepType.SET_CARD_SHOWN_FACE,
            shownFace: SetCardShownFaceType.FRONT,
            getTargetCardsFromKey: "revealedCard",
          },
          {
            type: CardEffectStepType.CLEAR_CARD_TARGETS,
            clearTargetCardsFromKey: "revealedCard",
          },
        ],
      },
    },
  ],
};
