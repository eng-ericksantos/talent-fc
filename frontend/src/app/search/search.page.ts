import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { environment } from '../../environments/environment';
import { Jogador } from '../models/player.model';
import { FavoriteService } from '../services/favorite.service';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, FormsModule, IonIcon, RouterLink],
})
export class SearchPage {
  readonly playerService = inject(PlayerService);
  readonly favoritoService = inject(FavoriteService);

  // Carregar países do arquivo JSON
  private countries: string[] = [];
  private countryCodes: Record<string, string> = {};

  readonly isFilterOpen = signal(false);
  readonly maxAge = signal(21);
  readonly minPot = signal(80);
  readonly maxPot = signal(99);
  readonly position = signal('');
  readonly country = signal('');
  readonly countryQuery = signal('');
  readonly showCountrySuggestions = signal(false);

  readonly filteredCountries = computed(() => {
    const query = this.countryQuery().toLowerCase();
    if (!query) return this.countries.slice(0, 5); // Mostrar primeiros 5 se vazio
    return this.countries.filter((c) => c.toLowerCase().includes(query)).slice(0, 10);
  });

  constructor() {
    addIcons({ heart, heartOutline });
    this.carregarPaises();
    this.carregarCodigosPaises();
  }

  private carregarPaises() {
    // Carrega países do JSON
    fetch('/assets/data/countries.json')
      .then((res) => res.json())
      .then((data) => {
        this.countries = data;
      })
      .catch((err) => console.error('Erro ao carregar países:', err));
  }

  private carregarCodigosPaises() {
    // Carrega códigos ISO dos países
    fetch('/assets/data/country-codes.json')
      .then((res) => res.json())
      .then((data) => {
        this.countryCodes = data;
      })
      .catch((err) => console.error('Erro ao carregar códigos de país:', err));
  }

  getCountryFlagUrl(pais: string): string {
    const code = this.countryCodes[pais]?.toLowerCase() || 'xx';
    // Usando flagcdn.com - CDN confiável para bandeiras
    return `https://flagcdn.com/w80/${code}.webp`;
  }

  readonly toggleFilters = () => {
    this.isFilterOpen.update((value) => !value);
  };

  readonly selecionarPais = (pais: string) => {
    this.country.set(pais);
    this.countryQuery.set('');
    this.showCountrySuggestions.set(false);
  };

  readonly ocultarSugestoes = () => {
    // Pequeno delay para permitir click na sugestão
    setTimeout(() => this.showCountrySuggestions.set(false), 150);
  };

  readonly aplicarFiltros = () => {
    this.playerService.setSearchFilters({
      maxAge: this.maxAge(),
      minPot: this.minPot(),
      maxPot: this.maxPot(),
      position: this.position(),
      country: this.country(),
    });
    this.isFilterOpen.set(false);
  };

  readonly limparFoto = (event: Event) => {
    (event.target as HTMLImageElement).style.display = 'none';
  };

  fotoUrl(jogador: Jogador): string {
    return `${environment.apiUrl}/players/proxy-image?eaId=${jogador.eaPlayerId}`;
  }
}

