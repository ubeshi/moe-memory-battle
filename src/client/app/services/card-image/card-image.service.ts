import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CardImageService {
  public getRandomColor(): string {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  public getRandomSolidColorCardImageUrl(): string {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = this.getRandomColor();
      context.fillRect(0, 0, 128, 128);
      return canvas.toDataURL();
    } else {
      throw new Error("Could not get 2d context");
    }
  }
}
