import { TurnPhaseType } from "./memory-game";

export interface CardSlot {
  shownFace: CardFace;
  card: Card;
}

interface BaseFieldSlot {
  type: FieldSlotType;
}

export enum FieldSlotType {
  CARD = "card",
  EMPTY = "empty",
}

export interface CardFieldSlot extends BaseFieldSlot {
  type: FieldSlotType.CARD;
  cardSlot: CardSlot;
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
  name: string;
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
  ClearCardTargetsCardEffectStep |
  SelectFieldSlotTargetsCardEffectStep |
  ClearFieldSlotTargetsCardEffectStep |
  SelectPlayerTargetsCardEffectStep |
  ClearPlayerTargetsCardEffectStep |
  SetCardShownFaceCardEffectStep |
  ShowCardsToPlayersCardEffectStep |
  WaitForPlayersConfirmCardEffectStep |
  AddPhaseToCurrentTurnCardEffectStep |
  ExchangeFieldSlotContentsCardEffectStep;

export enum CardEffectStepType {
  SELECT_CARD_TARGETS = "selectCardTargets",
  CLEAR_CARD_TARGETS = "clearCardTargets",
  SELECT_FIELD_SLOT_TARGETS = "selectFieldSlotTargets",
  CLEAR_FIELD_SLOT_TARGETS = "clearFieldSlotTargets",
  SELECT_PLAYER_TARGETS = "selectPlayerTargets",
  CLEAR_PLAYER_TARGETS = "clearPlayerTargets",
  SET_CARD_SHOWN_FACE = "setCardShownFace",
  SHOW_CARDS_TO_PLAYERS = "showCardsToPlayers",
  WAIT_FOR_PLAYERS_CONFIRM = "waitForPlayersConfirm",
  ADD_PHASE_TO_CURRENT_TURN = "addPhaseToCurrentTurn",
  EXCHANGE_FIELD_SLOT_CONTENTS = "exchangeFieldSlotContents",
}

export type SelectCardTargetsCardEffectStep = SelectNonFieldCardTargetsCardEffectStep | SelectFieldCardTargetsCardEffectStep;

export interface BaseSelectCardTargetsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.SELECT_CARD_TARGETS;
  zone: CardZoneType;
  zoneOwnerTypes: CardZoneOwnerType[];
  targetTypes: CardTargetCardType[];
  quantity: number;
  saveTargetCardsToKey: string;
}

export interface SelectNonFieldCardTargetsCardEffectStep extends BaseSelectCardTargetsCardEffectStep {
  zone: Exclude<CardZoneType, CardZoneType.FIELD>;
}

export interface SelectFieldCardTargetsCardEffectStep extends BaseSelectCardTargetsCardEffectStep {
  zone: CardZoneType.FIELD;
  effectShape: FieldCardEffectShape;
}

export interface SelectFieldSlotTargetsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.SELECT_FIELD_SLOT_TARGETS;
  quantity: number;
  saveTargetFieldSlotsToKey: string;
  targetTypes: FieldSlotTargetType[];
}

export interface ClearFieldSlotTargetsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.CLEAR_FIELD_SLOT_TARGETS;
  clearTargetFieldSlotsFromKey: string;
}

export interface ClearCardTargetsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.CLEAR_CARD_TARGETS;
  clearTargetCardsFromKey: string;
}

export interface SelectPlayerTargetsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.SELECT_PLAYER_TARGETS;
  targetTypes: CardTargetPlayerType[];
  quantity: number;
  saveTargetPlayersToKey: string;
}

export interface ClearPlayerTargetsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.CLEAR_PLAYER_TARGETS;
  clearTargetPlayersFromKey: string;
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

export interface WaitForPlayersConfirmCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.WAIT_FOR_PLAYERS_CONFIRM;
}

export interface AddPhaseToCurrentTurnCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.ADD_PHASE_TO_CURRENT_TURN;
  phaseType: TurnPhaseType;
}

export interface ExchangeFieldSlotContentsCardEffectStep extends BaseCardEffectStep {
  type: CardEffectStepType.EXCHANGE_FIELD_SLOT_CONTENTS;
  getSourceSlotsFromKey: string;
  sourceTargetType: TargetType;
  getDestinationSlotsFromKey: string;
  destinationTargetType: TargetType;
}

export enum SetCardShownFaceType {
  FRONT = CardFace.FRONT,
  BACK = CardFace.BACK,
  OPPOSITE = "opposite",
}

export interface CardAbility {
  name: string;
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
export type CardAbilityCost =
  MoveCardFromZoneToZoneCost |
  MoveCardSelfToZoneCost;

export interface MoveCardFromZoneToZoneCost extends BaseCardAbilityCost {
  type: CardAbilityCostType.MOVE_CARD_FROM_ZONE_TO_ZONE;
  sourceZone: CardZoneType;
  destinationZone: CardZoneType;
  quantity: number;
  targetTypes: CardTargetCardType[];
}

export interface MoveCardSelfToZoneCost extends BaseCardAbilityCost {
  type: CardAbilityCostType.MOVE_CARD_SELF_TO_ZONE;
  destinationZone: CardZoneType;
}

export enum CardAbilityCostType {
  MOVE_CARD_FROM_ZONE_TO_ZONE = "moveCardFromZoneToZone",
  MOVE_CARD_SELF_TO_ZONE = "moveCardSelfToZone",
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
}

export enum CardTargetPlayerType {
  ANY = "any",
  SELF = "self",
  OPPONENT = "opponent",
}

export enum CardZoneOwnerType {
  SELF = "self",
  OPPONENT = "opponent",
}

export enum FieldCardEffectShape {
  SINGLE = "single",
  CROSS_SIZE_ONE = "crossSizeOne",
}

export enum FieldSlotTargetType {
  EMPTY = "empty",
  CARD = "card",
}

export enum TargetType {
  CARD = "card",
  FIELD_SLOT = "fieldSlot",
}
