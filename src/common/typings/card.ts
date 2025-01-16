interface BaseFieldSlot {
  type: FieldSlotType;
}

export enum FieldSlotType {
  CARD = "card",
  EMPTY = "empty",
}

export interface CardFieldSlot extends BaseFieldSlot {
  type: FieldSlotType.CARD;
  card: Card;
  shownFace: CardFace;
}

export interface EmptyFieldSlot extends BaseFieldSlot {
  type: FieldSlotType.EMPTY;
}

export type FieldSlot = CardFieldSlot | EmptyFieldSlot;

export interface Field {
  slots: FieldSlot[];
}

export interface Card {
  imageUrl: string;
  abilities: CardAbility[];
}

export enum CardFace {
  FRONT = "front",
  BACK = "back",
}

export interface CardEffect {
  steps: CardEffectStep[];
}

export interface BaseCardEffectStep {
  type: CardEffectStepType;
}

export type CardEffectStep =
  SelectCardTargetsCardEffectStep |
  SelectPlayerTargetsCardEffectStep |
  SetCardShownFaceCardEffectStep |
  ShowCardsToPlayersCardEffectStep;

export enum CardEffectStepType {
  SELECT_CARD_TARGETS = "selectCardTargets",
  SELECT_PLAYER_TARGETS = "selectPlayerTargets",
  SET_CARD_SHOWN_FACE = "setCardShownFace",
  SHOW_CARDS_TO_PLAYERS = "showCardsToPlayers",
}

export interface SelectCardTargetsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.SELECT_CARD_TARGETS;
  zone: CardZoneType;
  targetTypes: CardTargetCardType[];
  quantity: number;
  saveTargetCardsToKey: string;
}

export interface SelectPlayerTargetsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.SELECT_PLAYER_TARGETS;
  targetTypes: CardTargetPlayerType[];
  quantity: number;
  saveTargetPlayersToKey: string;
}

export interface SetCardShownFaceCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.SET_CARD_SHOWN_FACE;
  shownFace: SetCardShownFaceType;
  getTargetCardsFromKey: string;
}

export interface ShowCardsToPlayersCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.SHOW_CARDS_TO_PLAYERS;
  getTargetCardsFromKey: string;
  getTargetPlayersFromKey: string;
}

export enum SetCardShownFaceType {
  FRONT = CardFace.FRONT,
  BACK = CardFace.BACK,
  OPPOSITE = "opposite",
}

export interface CardAbility {
  description: string;
  costOptions: CardAbilityCostOption[];
  effect: CardEffect;
}

export interface CardAbilityCostOption {
  costs: CardAbilityCost[];
}

export interface BaseCardAbilityCost {
  type: CardAbilityCostType;
}
export type CardAbilityCost = MoveCardFromZoneToZoneCost;

export interface MoveCardFromZoneToZoneCost extends BaseCardAbilityCost {
  type: CardAbilityCostType.MOVE_CARD_FROM_ZONE_TO_ZONE;
  sourceZone: CardZoneType;
  destinationZone: CardZoneType;
  quantity: number;
  targetTypes: CardTargetCardType[];
}

export enum CardAbilityCostType {
  MOVE_CARD_FROM_ZONE_TO_ZONE,
}

export enum CardZoneType {
  HAND = "hand",
  ACTIVATION = "activation",
  EXHAUST = "exhaust",
  DISCARD = "discard",
  MATCH = "match",
  FIELD = "field",
}

export enum CardTargetCardType {
  ANY = "any",
  SELF = "self",
}

export enum CardTargetPlayerType {
  ANY = "any",
  SELF = "self",
  OPPONENT = "opponent",
}
