import { fakeAsync, flush, tick } from "@angular/core/testing";
import { Card, CardFace, Deck } from "@common/typings/card";
import {
  flipCardFaceDown,
  flipCardFaceUp,
  getCardCopy,
  getDeckCopy,
  getDeckSlotCopy,
  getFaceDownCardsFromDeck,
  getFaceUpCardsFromDeck,
  isDeckEmpty,
  isNotNull,
  wait
} from "./memory-game.utils";

describe("memory-game utils", () => {
  describe("isNotNull()", () => {
    it("should return false when the input is null", () => {
      expect(isNotNull(null)).toBeFalse();
    });

    it("should return true when the input is not null", () => {
      expect(isNotNull(0)).toBeTrue();
      expect(isNotNull("foobar")).toBeTrue();
      expect(isNotNull({})).toBeTrue();
      expect(isNotNull(undefined)).toBeTrue();
    });
  });

  describe("getFaceUpCardsFromDeck()", () => {
    it("should return no cards when the deck is empty", () => {
      expect(getFaceUpCardsFromDeck([]).length).toBe(0);
    });

    it("should return no cards when all the cards are face down", () => {
      const faceDownCard1 = { shownFace: CardFace.BACK } as Card;
      const faceDownCard2 = { shownFace: CardFace.BACK } as Card;
      const faceDownCard3 = { shownFace: CardFace.BACK } as Card;
      const mockDeck = [faceDownCard1, faceDownCard2, faceDownCard3];
      expect(getFaceUpCardsFromDeck(mockDeck).length).toBe(0);
    });
    it("should return only the face up cards", () => {
      const faceUpCard1 = { shownFace: CardFace.FRONT } as Card;
      const faceUpCard2 = { shownFace: CardFace.FRONT } as Card;
      const faceUpCard3 = { shownFace: CardFace.FRONT } as Card;
      const faceDownCard1 = { shownFace: CardFace.BACK } as Card;
      const faceDownCard2 = { shownFace: CardFace.BACK } as Card;
      const faceDownCard3 = { shownFace: CardFace.BACK } as Card;
      const mockDeck = [
        faceUpCard1,
        faceDownCard2,
        faceDownCard1,
        faceUpCard3,
        faceDownCard3,
        faceUpCard2,
      ];

      const resultDeck = getFaceUpCardsFromDeck(mockDeck);

      expect(resultDeck.includes(faceUpCard1)).toBeTrue();
      expect(resultDeck.includes(faceUpCard2)).toBeTrue();
      expect(resultDeck.includes(faceUpCard3)).toBeTrue();
      expect(resultDeck.length).toBe(3);
    });
  });

  describe("getFaceDownCardsFromDeck()", () => {
    it("should return no cards when the deck is empty", () => {
      expect(getFaceDownCardsFromDeck([]).length).toBe(0);
    });

    it("should return no cards when all the cards are face up", () => {
      const faceUpCard1 = { shownFace: CardFace.FRONT } as Card;
      const faceUpCard2 = { shownFace: CardFace.FRONT } as Card;
      const faceUpCard3 = { shownFace: CardFace.FRONT } as Card;
      const mockDeck = [faceUpCard1, faceUpCard2, faceUpCard3];
      expect(getFaceDownCardsFromDeck(mockDeck).length).toBe(0);
    });

    it("should return only the face down cards", () => {
      const faceUpCard1 = { shownFace: CardFace.FRONT } as Card;
      const faceUpCard2 = { shownFace: CardFace.FRONT } as Card;
      const faceUpCard3 = { shownFace: CardFace.FRONT } as Card;
      const faceDownCard1 = { shownFace: CardFace.BACK } as Card;
      const faceDownCard2 = { shownFace: CardFace.BACK } as Card;
      const faceDownCard3 = { shownFace: CardFace.BACK } as Card;
      const mockDeck = [
        faceUpCard1,
        faceDownCard2,
        faceDownCard1,
        faceUpCard3,
        faceDownCard3,
        faceUpCard2,
      ];

      const resultDeck = getFaceDownCardsFromDeck(mockDeck);

      expect(resultDeck.includes(faceDownCard1)).toBeTrue();
      expect(resultDeck.includes(faceDownCard2)).toBeTrue();
      expect(resultDeck.includes(faceDownCard3)).toBeTrue();
      expect(resultDeck.length).toBe(3);
    });
  });

  describe("wait()", () => {
    it("should not resolve before the time has expired", fakeAsync(() => {
      let isWaitComplete = false;

      wait(1000).then(() => isWaitComplete = true);
      tick(999);

      expect(isWaitComplete).toBeFalse();
      flush();
    }));

    it("should resolve when the time has expired", fakeAsync(() => {
      let isWaitComplete = false;

      wait(1000).then(() => isWaitComplete = true);
      tick(1000);

      expect(isWaitComplete).toBeTrue();
    }));
  });

  describe("getDeckCopy()", () => {
    let mockDeck: Deck;
    let mockCard: Card;

    beforeEach(() => {
      mockCard = {
        imageUrl: "foobar",
        shownFace: CardFace.FRONT,
      } as Card;
      mockDeck = [mockCard] as Deck;
    });

    it("should return a deck of items with different references", () => {
      const resultDeck = getDeckCopy(mockDeck);
      expect(resultDeck).not.toBe(mockDeck);
      expect(resultDeck[0]).not.toBe(mockDeck[0]);
      
    });

    it("should return a deck of items with the same values", () => {
      const resultDeck = getDeckCopy(mockDeck);
      expect(resultDeck).toEqual(mockDeck);
    });

    it("should return a deck of the same length", () => {
      const resultDeck = getDeckCopy(mockDeck);
      expect(resultDeck.length).toBe(mockDeck.length);
    });
  });

  describe("getDeckSlotCopy()", () => {
    let mockCard: Card;

    beforeEach(() => {
      mockCard = {
        imageUrl: "foobar",
        shownFace: CardFace.FRONT,
      } as Card;
    });

    it("should return null if the content of null", () => {
      expect(getDeckSlotCopy(null)).toBeNull();
    });

    it("should return a card with a different reference", () => {
      const returnedCard = getDeckSlotCopy(mockCard);
      expect(returnedCard).not.toBe(mockCard);
    });

    it("should return a card with the same values", () => {
      const returnedCard = getDeckSlotCopy(mockCard);
      expect(returnedCard).toEqual(mockCard);
    });
  });

  describe("getCardCopy()", () => {
    let mockCard: Card;

    beforeEach(() => {
      mockCard = {
        imageUrl: "foobar",
        shownFace: CardFace.FRONT,
      } as Card;
    });

    it("should return a card with a different reference", () => {
      const returnedCard = getCardCopy(mockCard);
      expect(returnedCard).not.toBe(mockCard);
    });

    it("should return a card with the same values", () => {
      const returnedCard = getCardCopy(mockCard);
      expect(returnedCard).toEqual(mockCard);
    });
  });

  describe("isDeckEmpty()", () => {
    it("should return true if there are no items in the deck", () => {
      expect(isDeckEmpty([])).toBeTrue();
    });

    it("should return true if all items are null", () => {
      expect(isDeckEmpty([null, null, null, null])).toBeTrue();
    });

    it("should return false if not all items are null", () => {
      const mockCard = {
        imageUrl: "foobar",
        shownFace: CardFace.FRONT,
      } as Card;

      expect(isDeckEmpty([null, null, mockCard, null])).toBeFalse();
    });
  });

  describe("flipCardFaceUp()", () => {
    it("should flip face down cards face up", () => {
      const mockCard = { shownFace: CardFace.BACK } as Card;
      flipCardFaceUp(mockCard);
      expect(mockCard.shownFace).toBe(CardFace.FRONT);
    });

    it("should should keep face up cards face up", () => {
      const mockCard = { shownFace: CardFace.FRONT } as Card;
      flipCardFaceUp(mockCard);
      expect(mockCard.shownFace).toBe(CardFace.FRONT);
    });
  });

  describe("flipCardFaceDown()", () => {
    it("should flip face up cards face down", () => {
      const mockCard = { shownFace: CardFace.FRONT } as Card;
      flipCardFaceDown(mockCard);
      expect(mockCard.shownFace).toBe(CardFace.BACK);
    });

    it("should should keep face down cards face down", () => {
      const mockCard = { shownFace: CardFace.BACK } as Card;
      flipCardFaceDown(mockCard);
      expect(mockCard.shownFace).toBe(CardFace.BACK);
    });
  });

});
