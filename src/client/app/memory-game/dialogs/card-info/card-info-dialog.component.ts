import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { Card } from "@common/typings/card";

export interface CardInfoDialogData {
  card: Card;
}

@Component({
  selector: "mmb-card-info-dialog",
  templateUrl: "./card-info-dialog.component.html",
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
  ],
})
export class CardInfoDialogComponent {
  private readonly data: CardInfoDialogData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef);

  public readonly card = this.data.card;

  handleCloseClicked(): void {
    this.dialogRef.close();
  }
}
