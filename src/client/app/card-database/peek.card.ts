import { Card, CardEffectStepType, CardTargetCardType, CardZoneType } from "@common/typings/card";
import { discardSelf, TARGET_PLAYER_SELF_KEY, targetPlayerSelf } from "./common";

export const peekCard: Card = {
  imageUrl: "",
  abilities: [
    {
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
            targetTypes: [CardTargetCardType.ANY],
            quantity: 1,
            saveTargetCardsToKey: "peekedCard",
          },
          targetPlayerSelf,
          {
            type: CardEffectStepType.SHOW_CARDS_TO_PLAYERS,
            getTargetCardsFromKey: "peekedCard",
            getTargetPlayersFromKey: TARGET_PLAYER_SELF_KEY,
          }
        ],
      },
    },
  ],
}
