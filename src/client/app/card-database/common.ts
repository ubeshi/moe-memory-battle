import {
  CardAbilityCost,
  CardAbilityCostType,
  CardEffectStep,
  CardEffectStepType,
  CardTargetCardType,
  CardTargetPlayerType,
  CardZoneType,
} from '@common/typings/card';

export const exhaustSelf: CardAbilityCost = {
  type: CardAbilityCostType.MOVE_CARD_FROM_ZONE_TO_ZONE,
  sourceZone: CardZoneType.HAND,
  destinationZone: CardZoneType.EXHAUST,
  quantity: 1,
  targetTypes: [CardTargetCardType.SELF],
}

export const discardSelf: CardAbilityCost = {
  type: CardAbilityCostType.MOVE_CARD_FROM_ZONE_TO_ZONE,
  sourceZone: CardZoneType.HAND,
  destinationZone: CardZoneType.DISCARD,
  quantity: 1,
  targetTypes: [CardTargetCardType.SELF],
}

export const TARGET_PLAYER_SELF_KEY = "targetPlayerSelf";

export const targetPlayerSelf: CardEffectStep = {
  type: CardEffectStepType.SELECT_PLAYER_TARGETS,
  targetTypes: [CardTargetPlayerType.SELF],
  quantity: 1,
  saveTargetPlayersToKey: TARGET_PLAYER_SELF_KEY,
}
