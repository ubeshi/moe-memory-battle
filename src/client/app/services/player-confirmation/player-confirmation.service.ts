import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PlayerConfirmationService {
  private isWaitingForPlayerConfirmation$ = new BehaviorSubject(false);

  startWaitingForPlayerConfirmation(): void {
    this.isWaitingForPlayerConfirmation$.next(true);
  }

  stopWaitingForPlayerConfirmation(): void {
    this.isWaitingForPlayerConfirmation$.next(false);
  }

  getIsWaitingForPlayerConfirmation$(): Observable<boolean> {
    return this.isWaitingForPlayerConfirmation$.asObservable();
  }
}
