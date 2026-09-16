import {
  CardAbilityCost,
  CardAbilityCostType,
  CardEffectStep,
  CardEffectStepType,
  CardTargetPlayerType,
  CardZoneType,
} from "@common/typings/card";

export const exhaustSelf: CardAbilityCost = {
  type: CardAbilityCostType.MOVE_CARD_SELF_TO_ZONE,
  destinationZone: CardZoneType.EXHAUST,
};

export const discardSelf: CardAbilityCost = {
  type: CardAbilityCostType.MOVE_CARD_SELF_TO_ZONE,
  destinationZone: CardZoneType.DISCARD,
};

export const TARGET_PLAYER_SELF_KEY = "targetPlayerSelf";

export const targetPlayerSelf: CardEffectStep = {
  type: CardEffectStepType.SELECT_PLAYER_TARGETS,
  targetTypes: [CardTargetPlayerType.SELF],
  quantity: 1,
  saveTargetPlayersToKey: TARGET_PLAYER_SELF_KEY,
};

export const clearTargetPlayerSelf: CardEffectStep = {
  type: CardEffectStepType.CLEAR_PLAYER_TARGETS,
  clearTargetPlayersFromKey: TARGET_PLAYER_SELF_KEY,
}
