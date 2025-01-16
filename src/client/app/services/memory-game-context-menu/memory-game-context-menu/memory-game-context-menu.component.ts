import { OverlayRef } from "@angular/cdk/overlay";
import { Component, inject, OnDestroy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { CONTEXT_MENU_ACTIONS } from "../memory-game-context-menu-actions-injection-token";
import { ContextMenuAction } from "@common/typings/memory-game";

@Component({
  standalone: true,
  selector: "mmb-memory-game-context-menu",
  templateUrl: "./memory-game-context-menu.component.html",
  styleUrl: "./memory-game-context-menu.component.scss",
  imports: [
    MatButtonModule,
    MatCardModule,
  ],
})
export class MemoryGameContextMenuComponent implements OnDestroy {
  public readonly actions = inject(CONTEXT_MENU_ACTIONS);

  private readonly overlayRef = inject(OverlayRef);

  private readonly autoDisposeSubscription = this.overlayRef.outsidePointerEvents().subscribe(() => {
    this.overlayRef?.dispose();
  });

  ngOnDestroy(): void {
    this.autoDisposeSubscription.unsubscribe();
  }

  handleActionClicked(action: ContextMenuAction): void {
    action.callback();
    this.overlayRef.dispose();
  }
}
