import { Card, CardEffect, CardFace, Deck } from "@common/typings/card";
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
  removeCardsFromDeck,
  wait,
} from "./memory-game.utils";

describe("memory-game utils", () => {
  describe("isNotNull()", () => {
    it("should return false when the input is null", () => {
      expect(isNotNull(null)).toBe(false);
    });

    it("should return true when the input is not null", () => {
      expect(isNotNull(0)).toBe(true);
      expect(isNotNull("foobar")).toBe(true);
      expect(isNotNull({})).toBe(true);
      expect(isNotNull(undefined)).toBe(true);
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

      expect(resultDeck.includes(faceUpCard1)).toBe(true);
      expect(resultDeck.includes(faceUpCard2)).toBe(true);
      expect(resultDeck.includes(faceUpCard3)).toBe(true);
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

      expect(resultDeck.includes(faceDownCard1)).toBe(true);
      expect(resultDeck.includes(faceDownCard2)).toBe(true);
      expect(resultDeck.includes(faceDownCard3)).toBe(true);
      expect(resultDeck.length).toBe(3);
    });
  });

  describe("wait()", () => {
    it("should not resolve before the time has expired", async () => {
      let isWaitComplete = false;

      wait(1000).then(() => isWaitComplete = true);
      await jest.advanceTimersByTimeAsync(999);

      expect(isWaitComplete).toBe(false);
    });

    it("should resolve when the time has expired", async () => {
      let isWaitComplete = false;

      wait(1000).then(() => isWaitComplete = true);
      await jest.advanceTimersByTimeAsync(1000);

      expect(isWaitComplete).toBe(true);
    });
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

    it("should return null if the content is null", () => {
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
        effect: CardEffect.REVEAL,
      };
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

  describe("removeCardsFromDeck()", () => {
    let mockDeck: Deck;
    let mockCard1: Card;
    let mockCard2: Card;

    beforeEach(() => {
      mockCard1 = { imageUrl: "foo", shownFace: CardFace.FRONT } as Card;
      mockCard2 = { imageUrl: "bar", shownFace: CardFace.FRONT } as Card;
      mockDeck = [mockCard1, mockCard2] as Deck;
    });

    it("should return a deck with a different reference", () => {
      const returnedDeck = removeCardsFromDeck(mockDeck, []);
      expect(returnedDeck).not.toBe(mockDeck);
    });

    it("should return a deck without the removed cards", () => {
      const returnedDeck = removeCardsFromDeck(mockDeck, [mockCard1]);
      expect(returnedDeck.includes(mockCard1)).toBe(false);
    });

    it("should return a deck with the cards that were not removed", () => {
      const returnedDeck = removeCardsFromDeck(mockDeck, [mockCard1]);
      expect(returnedDeck.includes(mockCard2)).toBe(true);
    });
  });

  describe("isDeckEmpty()", () => {
    it("should return true if there are no items in the deck", () => {
      expect(isDeckEmpty([])).toBe(true);
    });

    it("should return true if all items are null", () => {
      expect(isDeckEmpty([null, null, null, null])).toBe(true);
    });

    it("should return false if not all items are null", () => {
      const mockCard = {
        imageUrl: "foobar",
        shownFace: CardFace.FRONT,
      } as Card;

      expect(isDeckEmpty([null, null, mockCard, null])).toBe(false);
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
