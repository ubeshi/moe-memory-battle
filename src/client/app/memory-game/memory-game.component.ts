// import { AfterViewInit, Component, inject, ViewChild } from "@angular/core";
// import { MatDialog } from "@angular/material/dialog";
// import { ActivatedRoute, Router } from "@angular/router";
// import { Card, CardFace, CardFieldSlot, CardZoneType, Field } from "@common/typings/card";
// import { GameAction, MemoryGameGuessResult, MemoryGamePlayer } from "@common/typings/player";
// import { MAIN_MENU_ROUTER_PATH } from "../main-menu/main-menu-routing-constants";
// import { ResolveCardEffectDialogComponent } from "./dialogs/resolve-card-effect/resolve-card-effect.dialog";
// import { MemoryGameAiPlayer } from "./memory-game-ai-player/memory-game-ai-player";
// import { shuffleArray } from "./memory-game-ai-player/memory-game-ai-player.utils";
// import { MemoryGameBoardComponent } from "./memory-game-board/memory-game-board.component";
// import { MemoryGameHandComponent } from "./memory-game-hand/memory-game-hand.component";
// import { MemoryGameHumanPlayer } from "./memory-game-human-player/memory-game-human-player";
// import { DIFFICULTY_ROUTE_PARAM, MemoryGameActivatedRouteParams } from "./memory-game-routing-constants";
// import { flipCardFaceDown, flipCardFaceUp, isDeckEmpty, isNotNull, removeCardsFromDeck, removeCardsFromHand, wait } from "./memory-game.utils";
// import { CardImageService } from '../services/card-image/card-image.service';
// import { peekCard } from "../card-database/peek.card";
// import { MemoryGameService } from "../services/memory-game/memory-game.service";

// const TURN_END_DELAY = 1000;

// @Component({
//   selector: "mmb-memory-game",
//   templateUrl: "./memory-game.component.html",
//   styleUrl: "./memory-game.component.scss",
//   standalone: false
// })
// export class MemoryGameComponent implements AfterViewInit {
//   private readonly memoryGameService = inject(MemoryGameService);

//   public field: Field = this.memoryGameService.getEmptyField();
//   public players: [MemoryGamePlayer, MemoryGamePlayer] = [
//     this.getStubPlayer(), this.getStubPlayer(),
//   ];
//   public isGameOver = false;

//   @ViewChild("gameBoard") memoryGameBoard: MemoryGameBoardComponent | undefined;
//   @ViewChild("playerHand") playerHand: MemoryGameHandComponent | undefined;

//   constructor(
//     private dialog: MatDialog,
//     private route: ActivatedRoute,
//     private router: Router,
//     private cardImageService: CardImageService,
//   ) { }

//   ngAfterViewInit(): void {
//     this.startNewGame().catch((error) => {
//       console.error(error);
//     });
//   }

//   async startNewGame(): Promise<void> {
//     const memoryGameBoard = this.memoryGameBoard;
//     if (memoryGameBoard === undefined) {
//       throw new Error("Could not find the game board");
//     }

//     const playerHand = this.playerHand;
//     if (playerHand === undefined) {
//       throw new Error("Could not find player hand");
//     }

//     this.isGameOver = false;
//     const params = this.route.snapshot.params as MemoryGameActivatedRouteParams;

//     this.field = await this.getNewCards();
//     this.players = [
//       new MemoryGameHumanPlayer(memoryGameBoard, playerHand),
//       new MemoryGameAiPlayer(this.field.slice(), params[DIFFICULTY_ROUTE_PARAM]),
//     ];
//     this.playGame().then(() => {
//       this.isGameOver = true;
//     }).catch((error) => {
//       throw error;
//     });
//   }

//   private async playGame(): Promise<void> {
//     while (!isDeckEmpty(this.field)) {
//       for (const player of this.players) {
//         const { card: firstGuessedCard, position: firstGuessedPosition } = await this.getMainPhaseOneResult(player);
//         this.players.forEach((player) => player.rememberContentAtPosition(firstGuessedCard, firstGuessedPosition));

//         const { card: secondGuessedCard, position: secondGuessedPosition } = await this.getPlayerSecondGuessResult(player, firstGuessedPosition);
//         this.players.forEach((player) => player.rememberContentAtPosition(secondGuessedCard, secondGuessedPosition));

//         await wait(TURN_END_DELAY);

//         const isPair = firstGuessedCard.imageUrl === secondGuessedCard.imageUrl;
//         if (isPair) {
//           this.handlePairMatched(firstGuessedCard, player);
//         } else {
//           flipCardFaceDown(firstGuessedCard);
//           flipCardFaceDown(secondGuessedCard);
//         }

//         if (isDeckEmpty(this.field)) {
//           return; // end game
//         }
//       }
//     }
//   }

//   private async getMainPhaseOneResult(player: MemoryGamePlayer): Promise<MemoryGameGuessResult> {
//     const gameActionResult = await Promise.any([
//       this.getPlayerFirstGuessResult(player).then((result) => ({ result, action: GameAction.GUESS_CARD })),
//       this.getPlayerPlayedCardResult(player).then((result) => ({ result, action: GameAction.PLAY_CARD })),
//     ]);

//     if (gameActionResult.action === GameAction.GUESS_CARD) {
//       flipCardFaceUp(gameActionResult.result.card);
//       return gameActionResult.result;
//     } else {
//       await this.playCard(player, gameActionResult.result.position);
//       const firstGuessResult = await this.getPlayerFirstGuessResult(player);
//       flipCardFaceUp(firstGuessResult.card);
//       return firstGuessResult;
//     }
//   }

//   private async getPlayerFirstGuessResult(player: MemoryGamePlayer): Promise<MemoryGameGuessResult> {
//     let firstGuessedCard: DeckSlotContent = null;
//     let firstGuessedPosition: number;
//     do {
//       firstGuessedPosition = await player.getFirstGuessPosition();
//       firstGuessedCard = this.field[firstGuessedPosition];
//     } while (firstGuessedCard === null);

//     return {
//       card: firstGuessedCard.card,
//       position: firstGuessedPosition,
//     };
//   }

//   private async getPlayerPlayedCardResult(player: MemoryGamePlayer): Promise<MemoryGameGuessResult> {
//     const playedCardPosition = await player.getPlayedCardFromHandPosition();
//     const playedCard = player.hand[playedCardPosition];

//     return {
//       card: playedCard,
//       position: playedCardPosition,
//     };
//   }

//   private async playCard(player: MemoryGamePlayer, playedCardPosition: number): Promise<void> {
//     const playedCard = player.hand[playedCardPosition];
//     player.hand = removeCardsFromHand(player.hand, [playedCard]);

//     await this.dialog.open(ResolveCardEffectDialogComponent, {
//       minWidth: "80vw",
//       data: {
//         card: playedCard,
//         deck: this.field,
//         players: this.players,
//       },
//     }).afterClosed().toPromise();
//   }

//   private async getPlayerSecondGuessResult(player: MemoryGamePlayer, firstGuessedPosition: number): Promise<MemoryGameGuessResult> {
//     let secondGuessedCard: DeckSlotContent = null;
//     let secondGuessedPosition: number;
//     do {
//       secondGuessedPosition = await player.getSecondGuessPosition(firstGuessedPosition);
//       secondGuessedCard = this.field[secondGuessedPosition];
//       if (secondGuessedCard === null) {
//         console.warn("player guessed null deck position", { player, firstGuessedPosition, secondGuessedPosition });
//       }
//     } while (secondGuessedCard === null);

//     flipCardFaceUp(secondGuessedCard.card);
//     return {
//       card: secondGuessedCard.card,
//       position: secondGuessedPosition,
//     };
//   }

//   public handlePairMatched(cardFromPair: Card, turnPlayer: MemoryGamePlayer): void {
//     const matchingCards = this.field.filter(isNotNull).filter((cardInGame) => cardInGame.card.imageUrl === cardFromPair.imageUrl);
//     const matchingCardsPositions = matchingCards.map((matchingCard) => this.field.indexOf(matchingCard));

//     this.field = removeCardsFromDeck(this.field, matchingCards);
//     this.players.forEach((player) => {
//       player.rememberContentAtPosition(null, matchingCardsPositions[0]);
//       player.rememberContentAtPosition(null, matchingCardsPositions[1]);
//     });
//     flipCardFaceUp(cardFromPair);
//     turnPlayer.hand.push(cardFromPair);
//   }

//   async getNewCards(): Promise<CardFieldSlot[]> {
//     const uniqueCardImages = await Promise.all([...Array(16).keys()].map(() => this.cardImageService.getRandomSolidColorCardImageUrl()));

//     // Create pairs of cards
//     const uniqueCards: CardFieldSlot[] = uniqueCardImages.map((imageUrl) => ({
//       card: { ...peekCard, imageUrl },
//       zone: CardZoneType.FIELD,
//       shownFace: CardFace.BACK,
//     }));
//     const uniqueCardDupes: CardFieldSlot[] = uniqueCards.map((card) => {
//       return JSON.parse(JSON.stringify(card));
//     });
//     const pairedCards = uniqueCards.concat(uniqueCardDupes);

//     return shuffleArray(pairedCards);
//   }

//   handleReturnToMainMenuClicked(): void {
//     this.router.navigate([MAIN_MENU_ROUTER_PATH]);
//   }

//   getStubPlayer(): MemoryGamePlayer {
//     const stubPlayer: MemoryGamePlayer = {
//       hand: [],
//       getFirstGuessPosition: function (): Promise<number> {
//         throw new Error("Function not implemented.");
//       },
//       getSecondGuessPosition: function (_firstGuessedPosition: number): Promise<number> {
//         throw new Error("Function not implemented.");
//       },
//       rememberContentAtPosition: function (_content: DeckSlotContent, _position: number): void {
//         throw new Error("Function not implemented.");
//       },
//       getPlayedCardFromHandPosition: function (): Promise<number> {
//         throw new Error("Function not implemented.");
//       },
//     };
//     return stubPlayer;
//   }
// }
