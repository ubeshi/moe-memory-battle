import { Injectable } from "@angular/core";
import { FieldSlotTargetType, FieldSlotType } from "@common/typings/card";
import { MemoryGame } from "@common/typings/memory-game";
import { BehaviorSubject, filter, firstValueFrom, map, Observable, shareReplay } from "rxjs";

export interface FieldSlotTargetingOptions {
  quantity: number;
  saveTargetFieldSlotsToKey: string;
  targetTypes: FieldSlotTargetType[];
}

export interface FieldSlotTarget {
  fieldSlotIndex: number;
}

export interface FieldSlotTargetsResult {
  fieldSlotTargets: FieldSlotTarget[];
}

@Injectable({
  providedIn: 'root',
})
export class FieldSlotTargetingService {
  private _fieldSlotTargetingOptions$ = new BehaviorSubject<FieldSlotTargetingOptions | undefined>(undefined);
  private _fieldSlotTargets$ = new BehaviorSubject<FieldSlotTarget[]>([]);
  private _fieldSlotTargetResultsMap = new Map<string, FieldSlotTargetsResult>();
  private _fieldSlotTargetDescription$ = this._fieldSlotTargetingOptions$.pipe(map((options) => {
    if (!options) {
      return undefined;
    } else {
      return this.getFieldSlotTargetDescriptionFromOptions(options);
    }
  }), shareReplay(1));

  public getFieldSlotTargetingOptions$(): Observable<FieldSlotTargetingOptions | undefined> {
    return this._fieldSlotTargetingOptions$;
  }

  public getFieldSlotTargetDescription(): Observable<string | undefined> {
    return this._fieldSlotTargetDescription$;
  }

  public async getFieldSlotTargets(options: FieldSlotTargetingOptions): Promise<FieldSlotTarget[]> {
    this._fieldSlotTargetingOptions$.next(options);
    this._fieldSlotTargets$.next([]);
    const fieldSlotTargets = await firstValueFrom(this._fieldSlotTargets$
      .pipe(filter((fieldSlotTargets) => fieldSlotTargets.length === options.quantity)));

    const key = options.saveTargetFieldSlotsToKey;
    this._fieldSlotTargetResultsMap.set(key, { fieldSlotTargets });
    this._fieldSlotTargetingOptions$.next(undefined);
    return fieldSlotTargets;
  }

  public async addFieldSlotTarget(fieldSlotTarget: FieldSlotTarget, memoryGame: MemoryGame): Promise<void> {
    const fieldSlotTargetingOptions = await firstValueFrom(this._fieldSlotTargetingOptions$);
    if (!fieldSlotTargetingOptions) {
      throw new Error("Not in targeting mode");
    }

    if (this.isValidFieldSlotTarget(fieldSlotTarget, fieldSlotTargetingOptions, memoryGame)) {
      this._fieldSlotTargets$.next([...this._fieldSlotTargets$.value, fieldSlotTarget]);
    } else {
      throw new Error("Invalid target");
    }
  }

  public getFieldSlotTargetsResultFromKey(key: string): FieldSlotTargetsResult {
    return this._fieldSlotTargetResultsMap.get(key) ?? { fieldSlotTargets: [] };
  }

  public clearFieldSlotTargetsFromKey(key: string): void {
    this._fieldSlotTargetResultsMap.delete(key);
  }

  public isValidFieldSlotTarget(fieldSlotTarget: FieldSlotTarget, fieldSlotTargetingOptions: FieldSlotTargetingOptions, memoryGame: MemoryGame): boolean {
    const targetTypes = fieldSlotTargetingOptions.targetTypes;
    const fieldSlot = memoryGame.field.slots[fieldSlotTarget.fieldSlotIndex];
    if (fieldSlot.type === FieldSlotType.CARD && targetTypes.includes(FieldSlotTargetType.CARD)) {
      return true;
    } else if (fieldSlot.type === FieldSlotType.EMPTY && targetTypes.includes(FieldSlotTargetType.EMPTY)) {
      return true;
    } else {
      return false;
    }
  }

  private getFieldSlotTargetDescriptionFromOptions(options: FieldSlotTargetingOptions): string {
    const targetTypes = options.targetTypes.map((targetType) => targetType.toLowerCase()).join(" or ");
    return `Select ${options.quantity} ${targetTypes} field slot(s)`;
  }
}
