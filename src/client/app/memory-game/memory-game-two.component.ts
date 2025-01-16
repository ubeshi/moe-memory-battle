import { Component, ElementRef, inject } from "@angular/core";
import { ContextMenuAction, MAXIMUM_PENALTY_MARKS, MAXIMUM_PENALTY_POINTS, MemoryGame, PlayerId, PlayerSlot, PlayerTeam, TurnPhaseType } from "@common/typings/memory-game";
import { MemoryGameService } from "../services/memory-game/memory-game.service";
import { Card, CardFace, CardFieldSlot, CardZoneType, FieldSlotType } from "@common/typings/card";
import { DeckService } from "../services/deck/deck.service";
import { PlayerControlType } from "@common/typings/player";
import { MemoryGameContextMenuService } from "../services/memory-game-context-menu/memory-game-context-menu.service";
import { wait } from "./memory-game.utils";

@Component({
  selector: "mmb-memory-game-two",
  templateUrl: "./memory-game-two.component.html",
  styleUrl: "./memory-game-two.component.scss",
  standalone: false
})
export class MemoryGameTwoComponent {
  private readonly memoryGameService = inject(MemoryGameService);
  private readonly deckService = inject(DeckService);
  private readonly memoryGameContextMenuService = inject(MemoryGameContextMenuService);

  public memoryGame: MemoryGame;
  public PlayerId = PlayerId;
  public CardZoneType = CardZoneType;
  public TurnPhaseType = TurnPhaseType;
  public playerSlots = [
    {
      playerId: PlayerId.PLAYER_ONE,
      controlType: PlayerControlType.LOCAL_HUMAN,
      player: { deck: this.deckService.getStarterDeck() },
    },
    {
      playerId: PlayerId.PLAYER_TWO,
      controlType: PlayerControlType.LOCAL_HUMAN,
      player: { deck: this.deckService.getStarterDeck() },
    },
  ];

  constructor() {
    this.memoryGame = this.getNewMemoryGame(this.playerSlots);
  }

  handlePlayCardClicked(memoryGame: MemoryGame, playerId: PlayerId, card: Card): void {
    const playerHand = memoryGame.playerZones[playerId][CardZoneType.HAND];
    const cardIndex = playerHand.cards.findIndex((handCard) => handCard === card);
    if (cardIndex === -1) {
      console.error("Could not find card in hand");
      return;
    }
    playerHand.cards.splice(cardIndex, 1);

    const playerActivationZone = memoryGame.playerZones[playerId][CardZoneType.ACTIVATION];
    playerActivationZone.cards.push(card);

    this.handleCardAbilityActivation(memoryGame, playerId, card);
  }

  handleCardAbilityActivation(memoryGame: MemoryGame, playerId: PlayerId, card: Card): void {
    // Handle card ability activation
  }

  getNewMemoryGame(playerSlots: PlayerSlot[]): MemoryGame {
    const numberOfPlayers = playerSlots.length;
    if (numberOfPlayers != 2) {
      throw new Error("This game currently only supports two players");
    }

    const turnBuffer = [
      this.memoryGameService.getDefaultTurn(playerSlots[0].playerId),
      this.memoryGameService.getDefaultTurn(playerSlots[1].playerId),
    ];

    const playerDecks = playerSlots.map((playerSlots) => playerSlots.player.deck);
    const field = this.memoryGameService.getInitialField(playerDecks);

    return {
      playerSlots,
      turnBuffer,
      playerZones: {
        [PlayerId.PLAYER_ONE]: this.memoryGameService.getPlayerZones(),
        [PlayerId.PLAYER_TWO]: this.memoryGameService.getPlayerZones(),
      },
      field,
      playerPenalties: {
        [PlayerId.PLAYER_ONE]: {
          penaltyMarks: 0,
          penaltyPoints: 0,
        },
        [PlayerId.PLAYER_TWO]: {
          penaltyMarks: 0,
          penaltyPoints: 0,
        },
      },
      playerTeams: {
        [PlayerId.PLAYER_ONE]: PlayerTeam.TEAM_ONE,
        [PlayerId.PLAYER_TWO]: PlayerTeam.TEAM_TWO,
      },
      lostTeams: [],
    };
  }

  handlePositionClicked(memoryGame: MemoryGame, { position, elementRef }: { position: number, elementRef: ElementRef }): void {
    console.log({ memoryGame, position, elementRef });
    const fieldSlot = memoryGame.field.slots[position];
    switch (fieldSlot.type) {
      case FieldSlotType.CARD: {
        console.log("Card clicked", { card: fieldSlot.card });
        this.handleFieldCardClicked(memoryGame, fieldSlot, elementRef);
        break;
      }
      case FieldSlotType.EMPTY: {
        console.log("Empty slot clicked");
        break;
      }
    }
  }

  handleFieldCardClicked(memoryGame: MemoryGame, fieldSlot: CardFieldSlot, elementRef: ElementRef): void {
    const turn = memoryGame.turnBuffer[0];
    const phase = turn.phases[0];
    const actions: ContextMenuAction[] = [];

    console.log({ turn, phase });

    const card = fieldSlot.card;
    const isCardFaceUp = fieldSlot.shownFace === CardFace.FRONT;
    if (isCardFaceUp) {
      actions.push({
        label: "Info",
        callback: () => { console.log(`Card info`, { card }) },
      });
    }

    const guessOneAction = {
      label: "Guess 1",
      callback: () => {
        // end all current turn play card phases
        while (turn.phases[0].type === TurnPhaseType.PLAY_CARD_PHASE) {
          turn.phases.shift();
        }
        // flip the card face up
        fieldSlot.shownFace = CardFace.FRONT;
        // end current flip phase one phase
        turn.phases.shift();
        // add the card to the flip phase one guesses
        turn.flipPhaseOneGuesses.push(fieldSlot);
      },
    }

    const guessTwoAction = {
      label: "Guess 2",
      callback: async () => {
        // flip the card face up
        fieldSlot.shownFace = CardFace.FRONT;
        // end current flip phase two phase
        turn.phases.shift();
        // add the card to the flip phase two guesses
        turn.flipPhaseTwoGuesses.push(fieldSlot);
      },
    }

    switch (phase.type) {
      case TurnPhaseType.PLAY_CARD_PHASE: {
        // TODO add play card warning if there are playable cards in hand
        actions.push(guessOneAction);
        this.memoryGameContextMenuService.open(elementRef, actions);
        break;
      }
      case TurnPhaseType.FLIP_PHASE_ONE: {
        actions.push(guessOneAction);
        this.memoryGameContextMenuService.open(elementRef, actions);
        break;
      }
      case TurnPhaseType.FLIP_PHASE_TWO: {
        if (!turn.flipPhaseOneGuesses.includes(fieldSlot)) {
          actions.push(guessTwoAction);
        }
        // Handle flip phase two
        this.memoryGameContextMenuService.open(elementRef, actions);
        break;
      }
      case TurnPhaseType.END_PHASE: {
        this.memoryGameContextMenuService.open(elementRef, actions);
        break;
      }
    }
  }


  // handlePhaseChange(memoryGame: MemoryGame): void {
  //   const turn = memoryGame.turnBuffer[0];
  //   const phase = turn.phases[0];

  //   const turnPlayer = turn.playerId;
  //   const playerTeam = memoryGame.playerTeams[turnPlayer];
  //   const isPlayerLost = memoryGame.lostTeams.includes(playerTeam);
  //   if (isPlayerLost) {
  //     // Skip all phases in current turn
  //     memoryGame.turnBuffer.splice(0, 1);
  //     return;
  //   }

  //   switch (phase.type) {
  //     case TurnPhaseType.PLAY_CARD_PHASE: {
  //       break;
  //     }
  //     case TurnPhaseType.FLIP_PHASE_ONE: {
  //       break;
  //     }
  //     case TurnPhaseType.FLIP_PHASE_TWO: {
  //       break;
  //     }
  //     case TurnPhaseType.END_PHASE: {
  //       this.handlePhaseChangedToEndPhase(memoryGame);
  //       break;
  //     }
  //   }
  // }

  handleContinueToEndPhaseClicked(memoryGame: MemoryGame): void {
    const turn = memoryGame.turnBuffer[0];
    const flipPhaseOneGuesses = turn.flipPhaseOneGuesses;
    const flipPhaseTwoGuesses = turn.flipPhaseTwoGuesses;

    const matches: [CardFieldSlot, CardFieldSlot][] = [];
    for (const flipPhaseOneGuess of flipPhaseOneGuesses) {
      for (const flipPhaseTwoGuess of flipPhaseTwoGuesses) {
        if (flipPhaseTwoGuess.card.imageUrl === flipPhaseOneGuess.card.imageUrl) {
          matches.push([flipPhaseOneGuess, flipPhaseTwoGuess]);
        }
      }
    }

    // change all guessed slots to face down
    flipPhaseOneGuesses.forEach((slot) => slot.shownFace = CardFace.BACK);
    flipPhaseTwoGuesses.forEach((slot) => slot.shownFace = CardFace.BACK);

    // for each matched pair, add one card to the player's match zone and one card to the player's hand
    const playerId = turn.playerId;
    const playerMatchZone = memoryGame.playerZones[playerId][CardZoneType.MATCH];
    const playerHand = memoryGame.playerZones[playerId][CardZoneType.HAND];
    const field = memoryGame.field;
    for (const [slotOne, slotTwo] of matches) {
      playerMatchZone.cards.push(slotOne.card);
      field.slots[field.slots.indexOf(slotOne)] = this.memoryGameService.getEmptyFieldSlot();
      playerHand.cards.push(slotTwo.card);
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
        memoryGame.lostTeams.push(memoryGame.playerTeams[playerId]);
      }
    }

    // append current player's next turn to turn buffer
    memoryGame.turnBuffer.push(this.memoryGameService.getDefaultTurn(playerId));

    // advance to next player's turn
    memoryGame.turnBuffer.splice(0, 1);
  }
}
