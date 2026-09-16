import { Card, CardEffectStepType, CardTargetCardType, CardZoneType, FieldCardEffectShape } from "@common/typings/card";
import { discardSelf, TARGET_PLAYER_SELF_KEY, targetPlayerSelf } from "./common";

export const peekCard: Card = {
  imageUrl: "",
  name: "Peek",
  abilities: [
    {
      name: "Peek",
      description: "Discard this card. Look at target card on the field.",
      costOptions: [
        {
          costs: [
            discardSelf,
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
            saveTargetCardsToKey: "peekedCard",
          },
          targetPlayerSelf,
          {
            type: CardEffectStepType.SHOW_CARDS_TO_PLAYERS,
            getTargetCardsFromKey: "peekedCard",
            getTargetPlayersFromKey: TARGET_PLAYER_SELF_KEY,
          },
          {
            type: CardEffectStepType.CLEAR_CARD_TARGETS,
            clearTargetCardsFromKey: "peekedCard",
          },
          {
            type: CardEffectStepType.CLEAR_PLAYER_TARGETS,
            clearTargetPlayersFromKey: TARGET_PLAYER_SELF_KEY,
          },
        ],
      },
    },
  ],
};
