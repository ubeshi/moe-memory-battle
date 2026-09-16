import { Card, CardEffectStepType, CardTargetCardType, CardZoneType, FieldCardEffectShape, FieldSlotTargetType, TargetType } from "@common/typings/card";
import { exhaustSelf } from "./common";

export const blinkCard: Card = {
  imageUrl: "",
  name: "Blink",
  abilities: [
    {
      name: "Blink",
      description: "Exhaust this card. Move target card on the field to target empty space.",
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
            saveTargetCardsToKey: "blinkedCard",
          },
          {
            type: CardEffectStepType.SELECT_FIELD_SLOT_TARGETS,
            quantity: 1,
            saveTargetFieldSlotsToKey: "blinkedFieldSlot",
            targetTypes: [FieldSlotTargetType.EMPTY],
          },
          {
            type: CardEffectStepType.EXCHANGE_FIELD_SLOT_CONTENTS,
            getSourceSlotsFromKey: "blinkedCard",
            sourceTargetType: TargetType.CARD,
            getDestinationSlotsFromKey: "blinkedFieldSlot",
            destinationTargetType: TargetType.FIELD_SLOT,
          },
          {
            type: CardEffectStepType.CLEAR_CARD_TARGETS,
            clearTargetCardsFromKey: "blinkedCard",
          },
          {
            type: CardEffectStepType.CLEAR_FIELD_SLOT_TARGETS,
            clearTargetFieldSlotsFromKey: "blinkedFieldSlot",
          },
        ],
      },
    },
  ],
};
