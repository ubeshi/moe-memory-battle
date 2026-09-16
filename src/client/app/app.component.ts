import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "mmb-app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  imports: [
    RouterOutlet,
  ],
})
export class AppComponent {
}
