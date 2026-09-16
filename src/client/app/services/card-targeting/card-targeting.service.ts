import { Injectable } from "@angular/core";
import { MemoryGameInstance } from "@client/app/classes/memory-game-instance";
import { Card, CardTargetCardType, CardZoneOwnerType, CardZoneType, FieldCardEffectShape as FieldCardEffectShape, FieldSlotType } from "@common/typings/card";
import { MemoryGame, PlayerId, PlayerZone } from "@common/typings/memory-game";
import { BehaviorSubject, filter, firstValueFrom, map, Observable } from "rxjs";

export interface CardTargetingOptions {
  zone: CardZoneType;
  zoneOwnerTypes: CardZoneOwnerType[];
  targetTypes: CardTargetCardType[];
  effectShape?: FieldCardEffectShape;
  quantity: number;
  saveTargetCardsToKey: string;
  activatedCard: Card;
  activatedPlayerId: PlayerId;
}

interface BaseCardTarget {
  zone: CardZoneType;
  cardPosition: number;
}

interface FieldCardTarget extends BaseCardTarget {
  zone: CardZoneType.FIELD;
}

interface PlayerZoneCardTarget extends BaseCardTarget {
  zone: CardZoneType.HAND | CardZoneType.EXHAUST | CardZoneType.DISCARD | CardZoneType.MATCH;
  playerId: PlayerId;
}

export type CardTarget = FieldCardTarget | PlayerZoneCardTarget;

export interface CardTargetsResult {
  cardTargets: CardTarget[];
  effectShape?: FieldCardEffectShape;
}

@Injectable({
  providedIn: "root",
})
export class CardTargetingService {
  private _cardTargetingOptions$ = new BehaviorSubject<CardTargetingOptions | undefined>(undefined);
  private _cardTargets$ = new BehaviorSubject<CardTarget[]>([]);
  private _isInTargetingMode = this._cardTargetingOptions$.pipe(map((options) => !!options));
  private _cardTargetDescription$ = this._cardTargetingOptions$.pipe(map((options) => {
    if (!options) {
      return undefined;
    } else {
      return this.getCardTargetDescriptionFromOptions(options);
    }
  }));
  private _cardTargetResultsMap = new Map<string, CardTargetsResult>();

  public getIsInTargetingMode$(): Observable<boolean> {
    return this._isInTargetingMode;
  }

  public getCardTargetDescription(): Observable<string | undefined> {
    return this._cardTargetDescription$;
  }

  public getCardTargetingOptions$(): Observable<CardTargetingOptions | undefined> {
    return this._cardTargetingOptions$.asObservable();
  }

  public async addCardTarget(cardTarget: CardTarget, memoryGame: MemoryGameInstance): Promise<void> {
    const cardTargetingOptions = await firstValueFrom(this._cardTargetingOptions$);
    if (!cardTargetingOptions) {
      throw new Error("Not in targeting mode");
    }

    if (this.isTargetCardValid(cardTarget, cardTargetingOptions, memoryGame)) {
      this._cardTargets$.next([...this._cardTargets$.value, cardTarget]);
    } else {
      throw new Error("Invalid target");
    }
  }

  public async getCardTargets(options: CardTargetingOptions): Promise<CardTarget[]> {
    this._cardTargetingOptions$.next(options);
    this._cardTargets$.next([]);
    const cardTargets = await firstValueFrom(this._cardTargets$
      .pipe(filter((cardTargets) => cardTargets.length === options.quantity)));

    const key = options.saveTargetCardsToKey;
    this._cardTargetResultsMap.set(key, { cardTargets, effectShape: options.effectShape });
    this._cardTargetingOptions$.next(undefined);
    return [...cardTargets];
  }

  public getCardTargetsResultFromKey(key: string): CardTargetsResult {
    return this._cardTargetResultsMap.get(key) ?? { cardTargets: [] };
  }

  public clearCardTargetsResultFromKey(key: string): void {
    this._cardTargetResultsMap.delete(key);
  }

  public isTargetCardValid(cardTarget: CardTarget, options: CardTargetingOptions, memoryGame: MemoryGameInstance): boolean {
    const isTargetCardZoneValid = this.isTargetCardZoneValid(cardTarget, options, memoryGame);
    const isTargetCardTypeValid = this.isTargetCardTypeValid(cardTarget, options, memoryGame);
    return isTargetCardTypeValid && isTargetCardZoneValid;
  }

  public isCardTargetingOptionsSatisfiable(options: CardTargetingOptions, memoryGame: MemoryGameInstance): boolean {
    if (options.zone === CardZoneType.FIELD) {
      return this.isFieldCardTargetingOptionsSatisfiable(options, memoryGame);
    } else {
      return this.isPlayerZoneCardTargetingOptionsSatisfiable(options, memoryGame);
    }
  }

  private isFieldCardTargetingOptionsSatisfiable(options: CardTargetingOptions, memoryGame: MemoryGameInstance): boolean {
    const cardTargets = memoryGame.field.slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.type === FieldSlotType.CARD)
      .map(({ index }) => ({ zone: CardZoneType.FIELD, cardPosition: index } as FieldCardTarget));

    const validCardTargets = cardTargets.filter((cardTarget) => this.isTargetCardValid(cardTarget, options, memoryGame));
    return validCardTargets.length >= options.quantity;
  }

  private isPlayerZoneCardTargetingOptionsSatisfiable(options: CardTargetingOptions, memoryGame: MemoryGameInstance): boolean {
    const zoneType = options.zone;
    if (zoneType === CardZoneType.FIELD) {
      return false;
    }

    const zoneOwnerTypes = options.zoneOwnerTypes;
    const validZones = zoneOwnerTypes.reduce((acc, zoneOwnerType) => {
      if (zoneOwnerType === CardZoneOwnerType.SELF) {
        acc.push({ zone: memoryGame.playerZones[options.activatedPlayerId][zoneType], playerId: options.activatedPlayerId });
      } else if (zoneOwnerType === CardZoneOwnerType.OPPONENT) {
        const activatingPlayerTeam = memoryGame.getPlayerTeamByPlayerId(options.activatedPlayerId);
        const opponentPlayerIds = memoryGame.playerSlots.filter((playerSlot) => {
          const playerTeam = memoryGame.getPlayerTeamByPlayerId(playerSlot.playerId);
          return playerTeam !== activatingPlayerTeam;
        }).map((playerSlot) => playerSlot.playerId);

        const opponentZones = opponentPlayerIds.map((playerId) => ({ zone: memoryGame.playerZones[playerId][zoneType], playerId }));
        acc.push(...opponentZones);
      }
      return acc;
    }
    , [] as { zone: PlayerZone, playerId: PlayerId }[]);

    if (validZones.length === 0) {
      return false;
    } else {
      return validZones.some(({ zone, playerId }) => {
        const validCardTargets = zone.cards.map((_, index) => ({ zone: zoneType, cardPosition: index, playerId } as PlayerZoneCardTarget))
          .filter((cardTarget) => this.isTargetCardValid(cardTarget, options, memoryGame));
        return validCardTargets.length >= options.quantity;
      });
    }
  }

  private isTargetCardZoneValid(cardTarget: CardTarget, options: CardTargetingOptions, memoryGame: MemoryGameInstance): boolean {
    if (cardTarget.zone !== options.zone) {
      return false;
    }

    if (cardTarget.zone !== CardZoneType.FIELD) {
      if (options.zoneOwnerTypes.includes(CardZoneOwnerType.SELF)) {
        return cardTarget.playerId === options.activatedPlayerId;
      }

      if (options.zoneOwnerTypes.includes(CardZoneOwnerType.OPPONENT)) {
        const playerTeam = memoryGame.getPlayerTeamByPlayerId(options.activatedPlayerId);
        const cardTargetTeam = memoryGame.getPlayerTeamByPlayerId(cardTarget.playerId);
        return playerTeam !== undefined && cardTargetTeam !== undefined && playerTeam !== cardTargetTeam;
      }
    }

    return true;
  }

  private isTargetCardTypeValid(_cardTarget: CardTarget, options: CardTargetingOptions, _memoryGame: MemoryGame): boolean {
    if (options.targetTypes.includes(CardTargetCardType.ANY)) {
      return true;
    }

    return true;
  }

  private getCardFromCardTarget(cardTarget: CardTarget, memoryGame: MemoryGame): Card | undefined {
    if (cardTarget.zone === CardZoneType.FIELD) {
      const fieldSlot = memoryGame.field.slots[cardTarget.cardPosition];
      if (fieldSlot.type === FieldSlotType.CARD) {
        return fieldSlot.cardSlot.card;
      } else {
        return undefined;
      }
    } else {
      const playerZone = memoryGame.playerZones[cardTarget.playerId][cardTarget.zone];
      return playerZone.cards[cardTarget.cardPosition];
    }
  }

  private getCardTargetDescriptionFromOptions(options: CardTargetingOptions): string {
    const quantity = options.quantity;
    const zoneOwnerTypes = options.zoneOwnerTypes;
    const zone = options.zone;

    let zoneOwnerTypeDescription = "";
    if (zoneOwnerTypes.includes(CardZoneOwnerType.SELF) && zoneOwnerTypes.includes(CardZoneOwnerType.OPPONENT)) {
      zoneOwnerTypeDescription = "any";
    } else if (zoneOwnerTypes.includes(CardZoneOwnerType.SELF)) {
      zoneOwnerTypeDescription = "your";
    } else if (zoneOwnerTypes.includes(CardZoneOwnerType.OPPONENT)) {
      zoneOwnerTypeDescription = "an opponent's";
    } else if (zone === CardZoneType.FIELD) {
      zoneOwnerTypeDescription = "the";
    }

    let pluralization = "";
    if (quantity !== 1) {
      pluralization = "s";
    }

    return `Select ${quantity} card${pluralization} from ${zoneOwnerTypeDescription} ${zone}.`;
  }
}
