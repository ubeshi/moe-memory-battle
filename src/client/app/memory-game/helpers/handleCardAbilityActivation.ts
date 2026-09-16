import { MemoryGameInstance } from "@client/app/classes/memory-game-instance";
import { AiMemoryService } from "@client/app/services/ai-memory/ai-memory.service";
import { CardTarget, CardTargetingService } from "@client/app/services/card-targeting/card-targeting.service";
import { PlayerTargetingService } from "@client/app/services/player-targeting/player-targeting.service";
import { Card, CardZoneType, CardAbilityCostType, CardEffectStepType, FieldSlotType, CardFace, SetCardShownFaceType, FieldCardEffectShape, SelectCardTargetsCardEffectStep, SelectPlayerTargetsCardEffectStep, ClearPlayerTargetsCardEffectStep, ShowCardsToPlayersCardEffectStep, SetCardShownFaceCardEffectStep, ClearCardTargetsCardEffectStep, AddPhaseToCurrentTurnCardEffectStep, SelectFieldSlotTargetsCardEffectStep, ClearFieldSlotTargetsCardEffectStep, ExchangeFieldSlotContentsCardEffectStep, TargetType } from "@common/typings/card";
import { MemoryGame, PlayerId, TurnPhaseType } from "@common/typings/memory-game";
import { PlayerControlType } from "@common/typings/player";
import { filter, firstValueFrom } from "rxjs";
import { FIELD_WIDTH, FIELD_SIZE } from "../memory-game-two.component";
import { PlayerConfirmationService } from "@client/app/services/player-confirmation/player-confirmation.service";
import { FieldSlotTarget, FieldSlotTargetingService } from "@client/app/services/field-slot-targeting/field-slot-targeting.service";

interface RequiredServices {
  cardTargetingService: CardTargetingService;
  playerTargetingService: PlayerTargetingService;
  aiMemoryService: AiMemoryService;
  playerConfirmationService: PlayerConfirmationService;
  fieldSlotTargetingService: FieldSlotTargetingService;
}

export async function handleCardAbilityActivation(memoryGame: MemoryGameInstance, playerId: PlayerId, card: Card, abilityIndex: number, costOptionIndex: number, services: RequiredServices): Promise<void> {
  // Handle card ability activation
  // Move card from hand to activation zone
  const playerHand = memoryGame.playerZones[playerId][CardZoneType.HAND];
  const activationZone = memoryGame.playerZones[playerId][CardZoneType.ACTIVATION];

  // BUG: If player has duplicate cards in hand, it will remove all of them
  playerHand.cards = playerHand.cards.filter((cardInHand) => cardInHand !== card);
  activationZone.cards = [...activationZone.cards, card];

  // Pay the pre-activation costs
  const costs = card.abilities[abilityIndex].costOptions[costOptionIndex].costs;
  for (const cost of costs) {
    switch (cost.type) {
      case CardAbilityCostType.MOVE_CARD_FROM_ZONE_TO_ZONE: {
        // TODO implement move card from zone to zone
      }
    }
  }

  // Activate the effect
  const effect = card.abilities[abilityIndex].effect;
  const steps = effect.steps;
  for (const step of steps) {
    switch (step.type) {
      case CardEffectStepType.SELECT_CARD_TARGETS: {
        await handleSelectCardTargets(services, step, { card, playerId });
        break;
      }
      case CardEffectStepType.SELECT_PLAYER_TARGETS: {
        await handleSelectPlayerTargets(services, step, { memoryGame, playerId });
        break;
      }
      case CardEffectStepType.CLEAR_PLAYER_TARGETS: {
        handleClearPlayerTargets(services, step);
        break;
      }
      case CardEffectStepType.SHOW_CARDS_TO_PLAYERS: {
        await handleShowCardsToPlayers(services, step, { memoryGame });
        break;
      }
      case CardEffectStepType.SET_CARD_SHOWN_FACE: {
        handleSetCardShownFace(services, step, { memoryGame });
        break;
      }
      case CardEffectStepType.WAIT_FOR_PLAYERS_CONFIRM: {
        await handleWaitForPlayersConfirm(services);
        break;
      }
      case CardEffectStepType.CLEAR_CARD_TARGETS: {
        handleClearCardTargets(services, step);
        break;
      }
      case CardEffectStepType.ADD_PHASE_TO_CURRENT_TURN: {
        handleAddPhaseToCurrentTurn(step, { memoryGame });
        break;
      }
      case CardEffectStepType.SELECT_FIELD_SLOT_TARGETS: {
        await handleSelectFieldSlotTargets(services, step);
        break;
      }
      case CardEffectStepType.CLEAR_FIELD_SLOT_TARGETS: {
        handleClearFieldSlotTargets(services, step);
        break;
      }
      case CardEffectStepType.EXCHANGE_FIELD_SLOT_CONTENTS: {
        handleExchangeFieldSlotContents(services, step, { memoryGame });
        break;
      }
    }
  }

  // Pay the post-activation costs
  for (const cost of costs) {
    switch (cost.type) {
      case CardAbilityCostType.MOVE_CARD_SELF_TO_ZONE: {
        if (cost.destinationZone === CardZoneType.FIELD) {
          // const destinationZone = memoryGame.field;
          // TODO implement field slot selection
        } else {
          const destinationZone = memoryGame.playerZones[playerId][cost.destinationZone];
          destinationZone.cards = [...destinationZone.cards, card];
        }
      }
    }
  }

  // Clear activation zone
  activationZone.cards = [];
}

function getAffectedPositions(cardTarget: CardTarget, effectShape: FieldCardEffectShape | undefined): CardTarget[] {
  switch (effectShape) {
    case FieldCardEffectShape.SINGLE: {
      return [cardTarget];
    }
    case FieldCardEffectShape.CROSS_SIZE_ONE: {
      return getAffectedPositionsForCrossSizeOne(cardTarget);
    }
    case undefined: {
      return [cardTarget];
    }
  }
}

function getAffectedPositionsForCrossSizeOne(cardTarget: CardTarget): CardTarget[] {
  const affectedPositions: CardTarget[] = [cardTarget];
  const positionIndex = cardTarget.cardPosition;

  const topIndex = positionIndex - FIELD_WIDTH;
  if (topIndex >= 0) {
    affectedPositions.push({ ...cardTarget, cardPosition: topIndex });
  }

  const bottomIndex = positionIndex + FIELD_WIDTH;
  if (bottomIndex < FIELD_SIZE) {
    affectedPositions.push({ ...cardTarget, cardPosition: bottomIndex });
  }

  const leftIndex = positionIndex - 1;
  const isLeftIndexSameRow = Math.floor(leftIndex / FIELD_WIDTH) === Math.floor(positionIndex / FIELD_WIDTH);
  if (leftIndex >= 0 && isLeftIndexSameRow) {
    affectedPositions.push({ ...cardTarget, cardPosition: leftIndex });
  }

  const rightIndex = positionIndex + 1;
  const isRightIndexSameRow = Math.floor(rightIndex / FIELD_WIDTH) === Math.floor(positionIndex / FIELD_WIDTH);
  if (rightIndex < FIELD_SIZE && isRightIndexSameRow) {
    affectedPositions.push({ ...cardTarget, cardPosition: rightIndex });
  }

  return affectedPositions;
}

async function waitForPlayerConfirmation(playerConfirmationService: PlayerConfirmationService): Promise<void> {
  playerConfirmationService.startWaitingForPlayerConfirmation();
  await firstValueFrom(playerConfirmationService.getIsWaitingForPlayerConfirmation$()
    .pipe(filter((isWaitingForPlayerConfirmation) => !isWaitingForPlayerConfirmation))
  );
}

async function handleSelectCardTargets(services: RequiredServices, step: SelectCardTargetsCardEffectStep, stepParams: {
  card: Card,
  playerId: PlayerId
}): Promise<void> {
  const { card, playerId } = stepParams;

  if (step.zone === CardZoneType.FIELD) {
    await services.cardTargetingService.getCardTargets({
      zone: step.zone,
      zoneOwnerTypes: step.zoneOwnerTypes,
      targetTypes: step.targetTypes,
      effectShape: step.effectShape,
      quantity: step.quantity,
      saveTargetCardsToKey: step.saveTargetCardsToKey,
      activatedCard: card,
      activatedPlayerId: playerId,
    });
  } else {
    // TODO
  }
}

async function handleSelectPlayerTargets(services: RequiredServices, step: SelectPlayerTargetsCardEffectStep, stepParams: {
  memoryGame: MemoryGame,
  playerId: PlayerId
}): Promise<void> {
  const { memoryGame, playerId } = stepParams;

  await services.playerTargetingService.getPlayerTargets(
    {
      targetTypes: step.targetTypes,
      quantity: step.quantity,
      saveTargetPlayersToKey: step.saveTargetPlayersToKey,
      activatedPlayerId: playerId,
    },
    memoryGame,
  );
}

function handleClearPlayerTargets(services: RequiredServices, step: ClearPlayerTargetsCardEffectStep): void {
  services.playerTargetingService.clearPlayerTargetsFromKey(step.clearTargetPlayersFromKey);
}

async function handleShowCardsToPlayers(services: RequiredServices, step: ShowCardsToPlayersCardEffectStep, stepParams: {
  memoryGame: MemoryGame,
}): Promise<void> {
  const { memoryGame } = stepParams;

  const { cardTargets, effectShape } = services.cardTargetingService.getCardTargetsResultFromKey(step.getTargetCardsFromKey);
  const playerTargets = services.playerTargetingService.getPlayerTargetsFromKey(step.getTargetPlayersFromKey);
  const affectedPositions = cardTargets.map((cardTarget) => getAffectedPositions(cardTarget, effectShape)).flat();

  for (const playerTarget of playerTargets) {
    if (playerTarget.player.controlType === PlayerControlType.LOCAL_HUMAN) {
      const affectedPositionsWithOriginalShownFace = affectedPositions.map((affectedPosition) => {
        const fieldSlot = memoryGame.field.slots[affectedPosition.cardPosition];
        if (fieldSlot.type === FieldSlotType.CARD) {
          return { affectedPosition, originalShownFace: fieldSlot.cardSlot?.shownFace };
        } else {
          return { affectedPosition, originalShownFace: undefined };
        }
      });

      for (const { affectedPosition } of affectedPositionsWithOriginalShownFace) {
        const fieldSlot = memoryGame.field.slots[affectedPosition.cardPosition];
        if (fieldSlot.type === FieldSlotType.CARD) {
          fieldSlot.cardSlot.shownFace = CardFace.FRONT;
        }
      };

      await waitForPlayerConfirmation(services.playerConfirmationService);

      for (const { affectedPosition, originalShownFace } of affectedPositionsWithOriginalShownFace) {
        const fieldSlot = memoryGame.field.slots[affectedPosition.cardPosition];
        if (fieldSlot.type === FieldSlotType.CARD && originalShownFace !== undefined) {
          fieldSlot.cardSlot.shownFace = originalShownFace;
        }
      }

    } else if (playerTarget.player.controlType === PlayerControlType.LOCAL_AI) {
      affectedPositions.forEach((affectedPosition) => {
        const fieldSlot = memoryGame.field.slots[affectedPosition.cardPosition];
        if (fieldSlot.type === FieldSlotType.CARD) {
          services.aiMemoryService.publishRevealedFieldCardSlot({
            playerIds: [playerTarget.playerId],
            card: fieldSlot.cardSlot.card,
            position: affectedPosition.cardPosition,
          });
        }
      });
    }
  }
}

function handleSetCardShownFace(services: RequiredServices, step: SetCardShownFaceCardEffectStep, stepParams: {
  memoryGame: MemoryGame,
}): void {
  const { memoryGame } = stepParams;

  const { cardTargets, effectShape } = services.cardTargetingService.getCardTargetsResultFromKey(step.getTargetCardsFromKey);

  for (const cardTarget of cardTargets) {
    // Only valid for field cards
    if (cardTarget.zone === CardZoneType.FIELD) {
      const affectedPositions = getAffectedPositions(cardTarget, effectShape);
      for (const affectedPosition of affectedPositions) {
        const fieldSlot = memoryGame.field.slots[affectedPosition.cardPosition];
        if (fieldSlot.type === FieldSlotType.CARD) {
          switch (step.shownFace) {
            case SetCardShownFaceType.FRONT: {
              fieldSlot.cardSlot.shownFace = CardFace.FRONT;
              services.aiMemoryService.publishRevealedFieldCardSlot({
                playerIds: memoryGame.playerSlots.map((playerSlot) => playerSlot.playerId),
                card: fieldSlot.cardSlot.card,
                position: affectedPosition.cardPosition,
              });
              break;
            }
            case SetCardShownFaceType.BACK: {
              fieldSlot.cardSlot.shownFace = CardFace.BACK;
              break;
            }
            case SetCardShownFaceType.OPPOSITE: {
              fieldSlot.cardSlot.shownFace = fieldSlot.cardSlot.shownFace === CardFace.FRONT ? CardFace.BACK : CardFace.FRONT;
              if (fieldSlot.cardSlot.shownFace === CardFace.FRONT) {
                services.aiMemoryService.publishRevealedFieldCardSlot({
                  playerIds: memoryGame.playerSlots.map((playerSlot) => playerSlot.playerId),
                  card: fieldSlot.cardSlot.card,
                  position: affectedPosition.cardPosition,
                });
              }
              break;
            }
          }
        }
      }
    }
  }
}

async function handleWaitForPlayersConfirm(services: RequiredServices): Promise<void> {
  await waitForPlayerConfirmation(services.playerConfirmationService);
}

function handleClearCardTargets(services: RequiredServices, step: ClearCardTargetsCardEffectStep): void {
  services.cardTargetingService.clearCardTargetsResultFromKey(step.clearTargetCardsFromKey);
}

function handleAddPhaseToCurrentTurn(step: AddPhaseToCurrentTurnCardEffectStep, stepParams: {
  memoryGame: MemoryGame,
}): void {
  const { memoryGame } = stepParams;
  const currentTurn = memoryGame.turns[memoryGame.currentTurnIndex];

  switch (step.phaseType) {
    case TurnPhaseType.FLIP_PHASE_ONE: {
      const existingFlipPhaseOneIndex = currentTurn.phases.findIndex((phase) => phase.type === TurnPhaseType.FLIP_PHASE_ONE);
      if (existingFlipPhaseOneIndex !== -1) {
        currentTurn.phases.splice(existingFlipPhaseOneIndex, 0, { type: TurnPhaseType.FLIP_PHASE_ONE });
      }
      break;
    }
  }

  // TODO handle other phase types
}

async function handleSelectFieldSlotTargets(services: RequiredServices, step: SelectFieldSlotTargetsCardEffectStep): Promise<void> {
  await services.fieldSlotTargetingService.getFieldSlotTargets({
    quantity: step.quantity,
    saveTargetFieldSlotsToKey: step.saveTargetFieldSlotsToKey,
    targetTypes: step.targetTypes,
  });
}

async function handleClearFieldSlotTargets(services: RequiredServices, step: ClearFieldSlotTargetsCardEffectStep): Promise<void> {
  services.fieldSlotTargetingService.clearFieldSlotTargetsFromKey(step.clearTargetFieldSlotsFromKey);
}

function handleExchangeFieldSlotContents(services: RequiredServices, step: ExchangeFieldSlotContentsCardEffectStep, stepParams: {
  memoryGame: MemoryGame,
}): void {
  const { memoryGame } = stepParams;

  const sourcePositions = step.sourceTargetType === TargetType.CARD ?
    getFieldPositionOfCardTargets(services.cardTargetingService.getCardTargetsResultFromKey(step.getSourceSlotsFromKey).cardTargets) :
    getFieldPositionOfFieldSlotTargets(services.fieldSlotTargetingService.getFieldSlotTargetsResultFromKey(step.getSourceSlotsFromKey).fieldSlotTargets);

  const destinationPositions = step.destinationTargetType === TargetType.CARD ?
    getFieldPositionOfCardTargets(services.cardTargetingService.getCardTargetsResultFromKey(step.getDestinationSlotsFromKey).cardTargets) :
    getFieldPositionOfFieldSlotTargets(services.fieldSlotTargetingService.getFieldSlotTargetsResultFromKey(step.getDestinationSlotsFromKey).fieldSlotTargets);

  sourcePositions.forEach((sourcePosition, index) => {
    const destinationPosition = destinationPositions[index];
    const sourceFieldSlot = memoryGame.field.slots[sourcePosition];
    const destinationFieldSlot = memoryGame.field.slots[destinationPosition];

    memoryGame.field.slots[sourcePosition] = destinationFieldSlot;
    memoryGame.field.slots[destinationPosition] = sourceFieldSlot;
  });
}

function getFieldPositionOfCardTargets(cardTargets: CardTarget[]): number[] {
  return cardTargets.map((cardTarget) => cardTarget.cardPosition);
}

function getFieldPositionOfFieldSlotTargets(fieldSlotTargets: FieldSlotTarget[]): number[] {
  return fieldSlotTargets.map((fieldSlotTarget) => fieldSlotTarget.fieldSlotIndex);
}
