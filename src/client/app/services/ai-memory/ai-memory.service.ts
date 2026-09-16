import { Injectable } from "@angular/core";
import { Card } from "@common/typings/card";
import { Observable, Subject } from "rxjs";

export interface RevealedFieldCardSlot {
  card: Card;
  position: number;
  playerIds: string[];
}

@Injectable({
  providedIn: "root",
})
export class AiMemoryService {
  private static instance: AiMemoryService;

  static getInstance(): AiMemoryService {
    return AiMemoryService.instance;
  }

  constructor() {
    if (!AiMemoryService.instance) {
      AiMemoryService.instance = this;
    }
  }

  private readonly revealedFieldCardSlot$ = new Subject<RevealedFieldCardSlot>();

  public getRevealedFieldCardSlot$(): Observable<RevealedFieldCardSlot> {
    return this.revealedFieldCardSlot$.asObservable();
  }

  public publishRevealedFieldCardSlot(revealedFieldCardSlot: RevealedFieldCardSlot): void {
    this.revealedFieldCardSlot$.next(revealedFieldCardSlot);
  }
}
