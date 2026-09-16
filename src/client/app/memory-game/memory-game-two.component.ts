import { Component, effect, ElementRef, inject, input } from "@angular/core";
import { ContextMenuAction, MAXIMUM_PENALTY_MARKS, MAXIMUM_PENALTY_POINTS, MemoryGame, PlayerId, PlayerSlot, PlayerTeam, TurnPhase, TurnPhaseType } from "@common/typings/memory-game";
import { MemoryGameService } from "../services/memory-game/memory-game.service";
import { CardEffectStepType, CardFace, CardFieldSlot, CardZoneType, EmptyFieldSlot, FieldSlotType } from "@common/typings/card";
import { PlayerControlType } from "@common/typings/player";
import { MemoryGameContextMenuService } from "../services/memory-game-context-menu/memory-game-context-menu.service";
import { firstValueFrom, Subscription } from "rxjs";
import { CardTarget, CardTargetingService } from "../services/card-targeting/card-targeting.service";
import { Dialog } from "@angular/cdk/dialog";
import { GameOverDialogAction, GameOverDialogComponent, GameOverDialogData, GameOverDialogResponse } from "./dialogs/game-over/game-over-dialog.component";
import { PlayerTargetingService } from "../services/player-targeting/player-targeting.service";
import { Router } from "@angular/router";
import { MAIN_MENU_ROUTER_PATH } from "../main-menu/main-menu-routing-constants";
import { PlayerService } from "../services/player/player.service";
import { MemoryGameInstance } from "../classes/memory-game-instance";
import { wait } from "./memory-game.utils";
import { CardInfoDialogComponent, CardInfoDialogData } from "./dialogs/card-info/card-info-dialog.component";
import { AiMemoryService } from "../services/ai-memory/ai-memory.service";
import { getAiDifficultyByName } from "@common/typings/ai-difficulty";
import { MemoryGameHandComponent } from "./memory-game-hand/memory-game-hand.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { MemoryGameBoardComponent } from "./memory-game-board/memory-game-board.component";
import { MatButtonModule } from "@angular/material/button";
import { PlayerConfirmationService } from "../services/player-confirmation/player-confirmation.service";
import { handleCardAbilityActivation } from "./helpers/handleCardAbilityActivation";
import { FieldSlotTargetingService } from "../services/field-slot-targeting/field-slot-targeting.service";

export const FIELD_WIDTH = 8;
export const FIELD_HEIGHT = 4;
export const FIELD_SIZE = FIELD_WIDTH * FIELD_HEIGHT;

@Component({
  selector: "mmb-memory-game-two",
  templateUrl: "./memory-game-two.component.html",
  styleUrl: "./memory-game-two.component.scss",
  imports: [
    MatButtonModule,
    MemoryGameHandComponent,
    MemoryGameBoardComponent,
    AsyncPipe,
    CommonModule,
  ],
})
export class MemoryGameTwoComponent {
  private readonly memoryGameService = inject(MemoryGameService);
  private readonly playerService = inject(PlayerService);
  private readonly memoryGameContextMenuService = inject(MemoryGameContextMenuService);
  private readonly cardTargetingService = inject(CardTargetingService);
  private readonly playerTargetingService = inject(PlayerTargetingService);
  private readonly playerConfirmationService = inject(PlayerConfirmationService);
  private readonly aiMemoryService = inject(AiMemoryService);
  private readonly fieldSlotTargetingService = inject(FieldSlotTargetingService);
  private readonly dialog = inject(Dialog);
  private readonly router = inject(Router);

  public static AI_TURN_DELAY_MS = 1000;

  // @Input(DIFFICULTY_ROUTE_PARAM) public aiDifficultyName = 'easy';
  public readonly _aiDifficultyName = input.required<string>({ alias: "aiDifficultyName" });
  public memoryGame: MemoryGameInstance | undefined;

  public PlayerId = PlayerId;
  public CardZoneType = CardZoneType;
  public TurnPhaseType = TurnPhaseType;
  public CardFace = CardFace;
  public currentPhaseSubscription: Subscription | undefined;
  public cardTargetDescription$ = this.cardTargetingService.getCardTargetDescription();
  public fieldSlotTargetDescription$ = this.fieldSlotTargetingService.getFieldSlotTargetDescription();
  public isWaitingForPlayerConfirmation$ = this.playerConfirmationService.getIsWaitingForPlayerConfirmation$();

  constructor() {
    effect(() => {
      const aiDifficultyName = this._aiDifficultyName();
      const aiDifficulty = getAiDifficultyByName(aiDifficultyName);
      const playerSlots = [
        {
          playerId: PlayerId.PLAYER_ONE,
          playerTeam: PlayerTeam.TEAM_ONE,
          player: this.playerService.getLocalHumanPlayer("Alice"),
        },
        {
          playerId: PlayerId.PLAYER_TWO,
          playerTeam: PlayerTeam.TEAM_TWO,
          player: this.playerService.getLocalAiPlayer(
            `Bob (${aiDifficulty.name})`,
            aiDifficulty
          ),
        },
      ];
      this.memoryGame = this.startNewMemoryGame(playerSlots);
    });
  }

  handleFieldPositionClicked(memoryGame: MemoryGameInstance, { position, elementRef }: { position: number, elementRef: ElementRef }): void {
    console.log({ memoryGame, position, elementRef });
    const fieldSlot = memoryGame.field.slots[position];
    switch (fieldSlot.type) {
      case FieldSlotType.CARD: {
        console.log("Card clicked", { card: fieldSlot.cardSlot.card });
        this.handleFieldCardClicked(memoryGame, fieldSlot, elementRef);
        break;
      }
      case FieldSlotType.EMPTY: {
        console.log("Empty slot clicked");
        this.handleFieldEmptySlotClicked(memoryGame, fieldSlot, elementRef);
        break;
      }
    }
  }

  async handleFieldCardClicked(memoryGame: MemoryGameInstance, fieldSlot: CardFieldSlot, elementRef: ElementRef): Promise<void> {
    const turn = await firstValueFrom(memoryGame.getCurrentTurn());
    const phase = await firstValueFrom(memoryGame.getCurrentPhase());
    const actions: ContextMenuAction[] = [];

    console.log({ turn, phase });

    const card = fieldSlot.cardSlot.card;
    const isCardFaceUp = fieldSlot.cardSlot.shownFace === CardFace.FRONT;
    if (isCardFaceUp) {
      actions.push({
        label: "Info",
        callback: () => {
          this.dialog.open<void, CardInfoDialogData, CardInfoDialogComponent>(CardInfoDialogComponent, { data: { card } });
        },
      });
    }

    const fieldSlotTargettingOptions = await firstValueFrom(this.fieldSlotTargetingService.getFieldSlotTargetingOptions$());
    if (fieldSlotTargettingOptions) {
      this.memoryGameContextMenuService.open(elementRef, actions);
      return;
    }

    const cardTargetingOptions = await firstValueFrom(this.cardTargetingService.getCardTargetingOptions$());
    const cardTarget: CardTarget = { zone: CardZoneType.FIELD, cardPosition: memoryGame.field.slots.indexOf(fieldSlot) };
    if (cardTargetingOptions) {
      const isTargetCardValid = this.cardTargetingService.isTargetCardValid(cardTarget, cardTargetingOptions, memoryGame);
      if (isTargetCardValid) {
        actions.push({
          label: "Select",
          callback: () => {
            this.cardTargetingService.addCardTarget(cardTarget, memoryGame);
          },
        });
      }
      this.memoryGameContextMenuService.open(elementRef, actions);
      return;
    }

    const guessOneAction = {
      label: "Guess 1",
      callback: async () => {
        // end all current turn play card phases
        while ((await firstValueFrom(memoryGame.getCurrentPhase())).type === TurnPhaseType.PLAY_CARD_PHASE) {
          memoryGame.goToNextPhase();
        }
        // flip the card face up
        fieldSlot.cardSlot.shownFace = CardFace.FRONT;
        this.aiMemoryService.publishRevealedFieldCardSlot({
          playerIds: memoryGame.playerSlots.map((playerSlot) => playerSlot.playerId),
          card: fieldSlot.cardSlot.card,
          position: memoryGame.field.slots.indexOf(fieldSlot),
        });
        // end current flip phase one phase
        memoryGame.goToNextPhase();
        // add the card to the flip phase one guesses
        turn.flipPhaseOneGuesses.push(fieldSlot);
      },
    };

    const guessTwoAction = {
      label: "Guess 2",
      callback: async () => {
        // flip the card face up
        fieldSlot.cardSlot.shownFace = CardFace.FRONT;
        this.aiMemoryService.publishRevealedFieldCardSlot({
          playerIds: memoryGame.playerSlots.map((playerSlot) => playerSlot.playerId),
          card: fieldSlot.cardSlot.card,
          position: memoryGame.field.slots.indexOf(fieldSlot),
        });
        // end current flip phase two phase
        memoryGame.goToNextPhase();
        // add the card to the flip phase two guesses
        turn.flipPhaseTwoGuesses.push(fieldSlot);
      },
    };

    const isWaitingForPlayerConfirmation = await firstValueFrom(this.playerConfirmationService.getIsWaitingForPlayerConfirmation$());
    switch (phase.type) {
      case TurnPhaseType.PLAY_CARD_PHASE: {
        // TODO add play card warning if there are playable cards in hand
        if (turn.playerId === PlayerId.PLAYER_ONE && !isWaitingForPlayerConfirmation) {
          actions.push(guessOneAction);
        }
        this.memoryGameContextMenuService.open(elementRef, actions);
        break;
      }
      case TurnPhaseType.FLIP_PHASE_ONE: {
        if (turn.playerId === PlayerId.PLAYER_ONE && !isWaitingForPlayerConfirmation) {
          actions.push(guessOneAction);
        }
        this.memoryGameContextMenuService.open(elementRef, actions);
        break;
      }
      case TurnPhaseType.FLIP_PHASE_TWO: {
        if (turn.playerId === PlayerId.PLAYER_ONE && !isWaitingForPlayerConfirmation) {
          if (!turn.flipPhaseOneGuesses.includes(fieldSlot)) {
            actions.push(guessTwoAction);
          }
        }
        this.memoryGameContextMenuService.open(elementRef, actions);
        break;
      }
      case TurnPhaseType.END_PHASE: {
        this.memoryGameContextMenuService.open(elementRef, actions);
        break;
      }
    }
  }

  async handleFieldEmptySlotClicked(memoryGame: MemoryGameInstance, fieldSlot: EmptyFieldSlot, elementRef: ElementRef): Promise<void> {
    const actions: ContextMenuAction[] = [];

    const fieldSlotTargetingOptions = await firstValueFrom(this.fieldSlotTargetingService.getFieldSlotTargetingOptions$());
    const fieldSlotTarget = { fieldSlotIndex: memoryGame.field.slots.indexOf(fieldSlot) };
    if (fieldSlotTargetingOptions && this.fieldSlotTargetingService.isValidFieldSlotTarget(fieldSlotTarget, fieldSlotTargetingOptions, memoryGame)) {
      actions.push({
        label: "Select",
        callback: () => {
          this.fieldSlotTargetingService.addFieldSlotTarget(fieldSlotTarget, memoryGame);
        },
      });
    }

    if (actions.length > 0) {
      this.memoryGameContextMenuService.open(elementRef, actions);
    }
  }

  async handleContinueToEndPhaseClicked(memoryGame: MemoryGameInstance): Promise<void> {
    const turn = await firstValueFrom(memoryGame.getCurrentTurn());
    const flipPhaseOneGuesses = turn.flipPhaseOneGuesses;
    const flipPhaseTwoGuesses = turn.flipPhaseTwoGuesses;

    const matches: [CardFieldSlot, CardFieldSlot][] = [];
    for (const flipPhaseOneGuess of flipPhaseOneGuesses) {
      for (const flipPhaseTwoGuess of flipPhaseTwoGuesses) {
        if (flipPhaseTwoGuess.cardSlot.card.name === flipPhaseOneGuess.cardSlot.card.name) {
          matches.push([flipPhaseOneGuess, flipPhaseTwoGuess]);
        }
      }
    }

    // change all guessed slots to face down
    flipPhaseOneGuesses.forEach((slot) => slot.cardSlot.shownFace = CardFace.BACK);
    flipPhaseTwoGuesses.forEach((slot) => slot.cardSlot.shownFace = CardFace.BACK);

    // for each matched pair, add one card to the player's match zone and one card to the player's hand
    const playerId = turn.playerId;
    const playerMatchZone = memoryGame.playerZones[playerId][CardZoneType.MATCH];
    const playerHand = memoryGame.playerZones[playerId][CardZoneType.HAND];
    const field = memoryGame.field;
    for (const [slotOne, slotTwo] of matches) {
      playerMatchZone.cards = [...playerMatchZone.cards, slotOne.cardSlot.card];
      field.slots[field.slots.indexOf(slotOne)] = this.memoryGameService.getEmptyFieldSlot();
      playerHand.cards = [...playerHand.cards, slotTwo.cardSlot.card];
      field.slots[field.slots.indexOf(slotTwo)] = this.memoryGameService.getEmptyFieldSlot();
    }

    // if there were no matches penalize the player
    if (matches.length === 0) {
      const currentPlayerPenalties = memoryGame.playerPenalties[playerId];
      currentPlayerPenalties.penaltyMarks++;
      while (currentPlayerPenalties.penaltyMarks >= MAXIMUM_PENALTY_MARKS) {
        currentPlayerPenalties.penaltyMarks -= MAXIMUM_PENALTY_MARKS;
        currentPlayerPenalties.penaltyPoints++;
      }
      if (currentPlayerPenalties.penaltyPoints >= MAXIMUM_PENALTY_POINTS) {
        // This player's team loses the game
        const playerSlot = memoryGame.playerSlots.find((playerSlot) => playerSlot.playerId === playerId);
        if (playerSlot) {
          const playerTeam = playerSlot.playerTeam;
          memoryGame.lostTeams.push(playerTeam);
          // If only one team remains, end the game
          if (memoryGame.teams.length - memoryGame.lostTeams.length <= 1) {
            this.handleGameOver(memoryGame);
            return;
          }
        }
      }
    } else {
      // clear the player's penalty marks
      memoryGame.playerPenalties[playerId].penaltyMarks = 0;
    }

    // if field has no cards left, end the game
    if (!field.slots.some((slot) => slot.type === FieldSlotType.CARD)) {
      this.handleGameOver(memoryGame);
      return;
    }

    memoryGame.appendTurnForPlayer(playerId);
    memoryGame.goToNextTurn();
  }

  async handlePlayerHandCardClicked(handPlayer: PlayerId, memoryGame: MemoryGameInstance, { position, elementRef }: { position: number, elementRef: ElementRef }): Promise<void> {
    const actions: ContextMenuAction[] = [];
    const card = memoryGame.playerZones[handPlayer][CardZoneType.HAND].cards[position];
    const turn = await firstValueFrom(memoryGame.getCurrentTurn());
    const phase = await firstValueFrom(memoryGame.getCurrentPhase());
    const turnPlayer = turn.playerId;
    if (turnPlayer === handPlayer) {
      if (phase.type === TurnPhaseType.PLAY_CARD_PHASE) {

        // TODO: check if ability cost can be paid
        // TODO: check if all target steps have valid targets before allowing activation
        const activateCardAbilityActions = card.abilities.map((ability, abilityIndex) => {
          const cardTargetingEffectSteps = ability.effect.steps.filter((step) => step.type === CardEffectStepType.SELECT_CARD_TARGETS);
          const isCardTargetingStepsSatisfiable = cardTargetingEffectSteps.map((step) => {
            const targetingOptions = {
              zone: step.zone,
              zoneOwnerTypes: step.zoneOwnerTypes,
              targetTypes: step.targetTypes,
              quantity: step.quantity,
              activatedCard: card,
              activatedPlayerId: handPlayer,
              saveTargetCardsToKey: step.saveTargetCardsToKey,
            };

            return this.cardTargetingService.isCardTargetingOptionsSatisfiable(targetingOptions, memoryGame);
          }).every((isSatisfiable) => isSatisfiable);

          if (!isCardTargetingStepsSatisfiable) {
            return undefined;
          }

          if (ability.costOptions.length === 1) {
            return {
              label: `Activate ability ${abilityIndex + 1}`,
              callback: () => {
                handleCardAbilityActivation(memoryGame, handPlayer, card, abilityIndex, 0, {
                  cardTargetingService: this.cardTargetingService,
                  playerTargetingService: this.playerTargetingService,
                  aiMemoryService: this.aiMemoryService,
                  playerConfirmationService: this.playerConfirmationService,
                  fieldSlotTargetingService: this.fieldSlotTargetingService,
                });
              },
            };
          } else {
            // TODO make sub menu to select cost option
            return undefined;
          }
        }).filter((action) => !!action);

        actions.push(...activateCardAbilityActions);
      }
    }

    actions.push({
      label: "Info",
      callback: () => {
        this.dialog.open<void, CardInfoDialogData, CardInfoDialogComponent>(CardInfoDialogComponent, { data: { card } });
      },
    });
    this.memoryGameContextMenuService.open(elementRef, actions);
  }

  async handleGameOver(memoryGame: MemoryGameInstance): Promise<void> {
    const dialogRef = this.dialog.open<GameOverDialogResponse, GameOverDialogData, GameOverDialogComponent>(
      GameOverDialogComponent,
      {
        ...GameOverDialogComponent.DIALOG_CONFIG,
        data: {
          memoryGame,
        },
      },
    );

    const gameOverDialogAction = (await firstValueFrom(dialogRef.closed))?.action;
    if (gameOverDialogAction === GameOverDialogAction.REMATCH) {
      this.memoryGame = this.startNewMemoryGame(memoryGame.playerSlots);
    } else {
      this.router.navigate([MAIN_MENU_ROUTER_PATH]);
    }
  }

  startNewMemoryGame(playerSlots: PlayerSlot[]): MemoryGameInstance {
    const memoryGame = new MemoryGameInstance(playerSlots);
    this.currentPhaseSubscription?.unsubscribe();
    this.currentPhaseSubscription = memoryGame.getCurrentPhase().subscribe((phase) => {
      const turn = memoryGame.turns[memoryGame.currentTurnIndex];
      if (turn) {
        const playerId = turn.playerId;
        const playerSlot = memoryGame?.playerSlots.find((playerSlot) => playerSlot.playerId === playerId);
        const isAiTurn = playerSlot?.player.controlType === PlayerControlType.LOCAL_AI;

        if (isAiTurn) {
          this.handleAiTurnPhase(playerSlot, phase, memoryGame);
        }
      }
    });
    return memoryGame;
  }

  async handleAiTurnPhase(playerSlot: PlayerSlot, phase: TurnPhase, memoryGame: MemoryGameInstance): Promise<void> {
    const aiPlayerInstance = memoryGame.aiPlayerInstances[playerSlot.playerId];

    switch (phase.type) {
      case TurnPhaseType.PLAY_CARD_PHASE: {
        // const hand = memoryGame.playerZones[playerSlot.playerId][CardZoneType.HAND];
        // const playableCards = hand.cards.filter((card) => card.abilities.length > 0);
        // if (playableCards.length > 0) {
        //   const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        //   const randomAbilityIndex = Math.floor(Math.random() * randomCard.abilities.length);
        //   this.handleCardAbilityActivation(memoryGame, playerSlot.playerId, randomCard, randomAbilityIndex, 0);
        // }
        await wait(MemoryGameTwoComponent.AI_TURN_DELAY_MS);
        memoryGame.goToNextPhase();
        break;
      }
      case TurnPhaseType.FLIP_PHASE_ONE: {
        const guessedCardSlot = aiPlayerInstance.getFlipPhaseOneGuessCardSlot(memoryGame);
        this.handleAiFlipPhaseOneGuess(memoryGame, guessedCardSlot);
        break;
      }
      case TurnPhaseType.FLIP_PHASE_TWO: {
        const guessedCardSlot = aiPlayerInstance.getFlipPhaseTwoGuessCardSlot(memoryGame);
        this.handleAiFlipPhaseTwoGuess(memoryGame, guessedCardSlot);
        break;
      }
      case TurnPhaseType.END_PHASE: {
        this.handleContinueToEndPhaseClicked(memoryGame);
        break;
      }
    }
  }

  async handleAiFlipPhaseOneGuess(memoryGame: MemoryGameInstance, slot: CardFieldSlot): Promise<void> {
    const turn = memoryGame.turns[memoryGame.currentTurnIndex];
    turn.flipPhaseOneGuesses.push(slot);
    slot.cardSlot.shownFace = CardFace.FRONT;
    this.aiMemoryService.publishRevealedFieldCardSlot({
      playerIds: memoryGame.playerSlots.map((playerSlot) => playerSlot.playerId),
      card: slot.cardSlot.card,
      position: memoryGame.field.slots.indexOf(slot),
    });
    await wait(MemoryGameTwoComponent.AI_TURN_DELAY_MS);
    memoryGame.goToNextPhase();
  }

  async handleAiFlipPhaseTwoGuess(memoryGame: MemoryGameInstance, slot: CardFieldSlot): Promise<void> {
    const turn = memoryGame.turns[memoryGame.currentTurnIndex];
    turn.flipPhaseTwoGuesses.push(slot);
    slot.cardSlot.shownFace = CardFace.FRONT;
    this.aiMemoryService.publishRevealedFieldCardSlot({
      playerIds: memoryGame.playerSlots.map((playerSlot) => playerSlot.playerId),
      card: slot.cardSlot.card,
      position: memoryGame.field.slots.indexOf(slot),
    });
    await wait(MemoryGameTwoComponent.AI_TURN_DELAY_MS);
    memoryGame.goToNextPhase();
  }

  getPlayerNameById(memoryGame: MemoryGame, playerId: PlayerId): string | undefined {
    const playerSlot = memoryGame.playerSlots.find((playerSlot) => playerSlot.playerId === playerId);
    return playerSlot?.player.name;
  }

  handleNewGameDebugClicked(): void {
    if (this.memoryGame) {
      this.memoryGame = this.startNewMemoryGame(this.memoryGame.playerSlots);
    }
  }

  handleConfirmClicked(): void {
    this.playerConfirmationService.stopWaitingForPlayerConfirmation();
  }
}
