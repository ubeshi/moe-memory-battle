import { AfterViewInit, Component, ViewChildren } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Card, CardFace, Deck, DeckSlotContent } from "@common/typings/card";
import { MemoryGameGuessResult, MemoryGamePlayer } from "@common/typings/player";
import { MAIN_MENU_ROUTER_PATH } from "../main-menu/main-menu-routing-constants";
import { WaifuApiService } from "../services/waifu-api/waifu-api.service";
import { MemoryGameAiPlayer } from "./memory-game-ai-player/memory-game-ai-player";
import { shuffleArray } from "./memory-game-ai-player/memory-game-ai-player.utils";
import { MemoryGameBoardComponent } from "./memory-game-board/memory-game-board.component";
import { MemoryGameHumanPlayer } from "./memory-game-human-player/memory-game-human-player";
import { DIFFICULTY_ROUTE_PARAM, MemoryGameActivatedRouteParams } from "./memory-game-routing-constants";
import { flipCardFaceDown, flipCardFaceUp, isDeckEmpty, isNotNull, removeCardsFromDeck, wait } from "./memory-game.utils";

const TURN_END_DELAY = 1000;
const DECK_SIZE = 32;

@Component({
  selector: "mmb-memory-game",
  templateUrl: "./memory-game.component.html",
  styleUrls: ["./memory-game.component.scss"],
})
export class MemoryGameComponent implements AfterViewInit {
  public deck: Deck = this.getStubDeck(DECK_SIZE);
  public players: [MemoryGamePlayer, MemoryGamePlayer] = [
    this.getStubPlayer(), this.getStubPlayer(),
  ];
  public isGameOver = false;

  @ViewChildren("gameBoard") memoryGameBoard: MemoryGameBoardComponent | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private waifuApiService: WaifuApiService,
  ) { }

  ngAfterViewInit(): void {
    this.startNewGame();
  }

  async startNewGame(): Promise<void> {
    const memoryGameBoard = this.memoryGameBoard;
    if (memoryGameBoard === undefined) {
      throw new Error("Could not find the game board");
    }

    this.isGameOver = false;
    const params = this.route.snapshot.params as MemoryGameActivatedRouteParams;

    this.deck = await this.getNewCards();
    this.players = [
      new MemoryGameHumanPlayer(memoryGameBoard),
      new MemoryGameAiPlayer(this.deck.slice(), params[DIFFICULTY_ROUTE_PARAM]),
    ];
    this.playGame().then(() => {
      this.isGameOver = true;
    });
  }

  private async playGame(): Promise<void> {
    while (!isDeckEmpty(this.deck)) {
      for (const player of this.players) {
        const { card: firstGuessedCard, position: firstGuessedPosition } = await this.getPlayerFirstGuessResult(player);
        this.players.forEach((player) => player.rememberContentAtPosition(firstGuessedCard, firstGuessedPosition));

        const { card: secondGuessedCard, position: secondGuessedPosition } = await this.getPlayerSecondGuessResult(player, firstGuessedPosition);
        this.players.forEach((player) => player.rememberContentAtPosition(secondGuessedCard, secondGuessedPosition));

        await wait(TURN_END_DELAY);

        const isPair = firstGuessedCard.imageUrl === secondGuessedCard.imageUrl;
        if (isPair) {
          this.handlePairMatched(firstGuessedCard, player);
        } else {
          flipCardFaceDown(firstGuessedCard);
          flipCardFaceDown(secondGuessedCard);
        }

        if (isDeckEmpty(this.deck)) {
          return; // end game
        }
      }
    }
  }

  private async getPlayerFirstGuessResult(player: MemoryGamePlayer): Promise<MemoryGameGuessResult> {
    let firstGuessedCard: DeckSlotContent = null;
    let firstGuessedPosition: number;
    do  {
      firstGuessedPosition = await player.getFirstGuessPosition();
      firstGuessedCard = this.deck[firstGuessedPosition];
    } while (firstGuessedCard === null);
    
    flipCardFaceUp(firstGuessedCard);
    return {
      card: firstGuessedCard,
      position: firstGuessedPosition,
    };
  }

  private async getPlayerSecondGuessResult(player: MemoryGamePlayer, firstGuessedPosition: number): Promise<MemoryGameGuessResult> {
    let secondGuessedCard: DeckSlotContent = null;
    let secondGuessedPosition: number;
    do  {
      secondGuessedPosition = await player.getSecondGuessPosition(firstGuessedPosition);
      secondGuessedCard = this.deck[secondGuessedPosition];
      if (secondGuessedCard === null) {
        console.warn("player guessed null deck position", { player, firstGuessedPosition, secondGuessedPosition });
      }
    } while (secondGuessedCard === null);

    flipCardFaceUp(secondGuessedCard);
    return {
      card: secondGuessedCard,
      position: secondGuessedPosition,
    };
  }

  public handlePairMatched(cardFromPair: Card, turnPlayer: MemoryGamePlayer): void {
    const matchingCards = this.deck.filter(isNotNull).filter((card) => card.imageUrl === cardFromPair.imageUrl);
    const matchingCardsPositions = matchingCards.map((matchingCard) => this.deck.indexOf(matchingCard));
    
    this.deck = removeCardsFromDeck(this.deck, matchingCards);
    this.players.forEach((player) => {
      player.rememberContentAtPosition(null, matchingCardsPositions[0]);
      player.rememberContentAtPosition(null, matchingCardsPositions[1]);
    });
    flipCardFaceUp(cardFromPair);
    turnPlayer.hand.push(cardFromPair);
  }

  async getNewCards(): Promise<Card[]> {
    const uniqueCardImages = await this.waifuApiService.getWaifus();

    // Create pairs of cards
    const uniqueCards: Card[] = uniqueCardImages.map((imageUrl) => ({ imageUrl, shownFace: CardFace.BACK }));
    const uniqueCardDupes: Card[] = uniqueCardImages.map((imageUrl) => ({ imageUrl, shownFace: CardFace.BACK }));
    const pairedCards = uniqueCards.concat(uniqueCardDupes);

    return shuffleArray(pairedCards);
  }

  handleReturnToMainMenuClicked(): void {
    this.router.navigate([MAIN_MENU_ROUTER_PATH]);
  }

  getStubDeck(deckSize: number): Deck {
    const stubCard = { shownFace: CardFace.BACK };
    return Array(deckSize).fill(stubCard);
  }

  getStubPlayer(): MemoryGamePlayer {
    const stubPlayer: MemoryGamePlayer = {
      hand: [],
      getFirstGuessPosition: function (): Promise<number> {
        throw new Error("Function not implemented.");
      },
      getSecondGuessPosition: function (_firstGuessedPosition: number): Promise<number> {
        throw new Error("Function not implemented.");
      },
      rememberContentAtPosition: function (_content: DeckSlotContent, _position: number): void {
        throw new Error("Function not implemented.");
      },
    };
    return stubPlayer;
  }
}
