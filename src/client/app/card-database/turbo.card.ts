import { Card, CardEffectStepType } from "@common/typings/card";
import { exhaustSelf } from "./common";
import { TurnPhaseType } from "@common/typings/memory-game";

export const turboCard: Card = {
  imageUrl: "",
  name: "Turbo",
  abilities: [
    {
      name: "Turbo",
      description: "Exhaust this card. Take an additional Flip Phase 1 this turn.",
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
            type: CardEffectStepType.ADD_PHASE_TO_CURRENT_TURN,
            phaseType: TurnPhaseType.FLIP_PHASE_ONE,
          },
        ],
      },
    },
  ],
};
