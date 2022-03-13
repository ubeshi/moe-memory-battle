import { SafeUrl } from "@angular/platform-browser";

export interface Card {
  image: SafeUrl;
  shownFace: CardFace;
}

export enum CardFace {
  FRONT,
  BACK,
}
