import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, FormsModule],
})
export class AdminPage {
  isLoggedIn = signal<boolean>(false);
  activeVersion = signal<number>(26);

  login(): void {
    this.isLoggedIn.set(true);
  }

  logout(): void {
    this.isLoggedIn.set(false);
  }

  atualizarScraper(): void {
    alert(`Scraper atualizado para EA FC ${this.activeVersion()}!`);
  }
}
