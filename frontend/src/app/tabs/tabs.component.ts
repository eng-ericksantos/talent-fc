import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { heartOutline, homeOutline, searchOutline, settingsOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IonIcon, TranslatePipe, LanguageSelectorComponent],
})
export class TabsComponent {
  readonly authService = inject(AuthService);

  constructor() {
    addIcons({ homeOutline, searchOutline, heartOutline, settingsOutline });
  }
}
