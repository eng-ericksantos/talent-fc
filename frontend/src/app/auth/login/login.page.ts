import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthError } from '@angular/fire/auth';
import { TranslatePipe } from '@ngx-translate/core';
import { IonApp, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    IonApp,
    IonContent,
  ],
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly formulario: FormGroup;
  readonly carregando = signal(false);
  readonly carregandoGoogle = signal(false);
  readonly erro = signal<string | null>(null);

  constructor() {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async fazerLogin(): Promise<void> {
    if (this.formulario.invalid) {
      this.erro.set('Por favor, preencha todos os campos corretamente');
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    try {
      const { email, senha } = this.formulario.value;
      await signInWithEmailAndPassword(this.auth, email, senha);
      this.router.navigateByUrl('/tabs/home');
    } catch (erro) {
      const authError = erro as AuthError;
      this.erro.set(this.traduzirErro(authError.code));
    } finally {
      this.carregando.set(false);
    }
  }

  async fazerLoginGoogle(): Promise<void> {
    this.carregandoGoogle.set(true);
    this.erro.set(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigateByUrl('/tabs/home');
    } catch (erro) {
      const authError = erro as AuthError;
      // Ignorar erros de cancelamento de popup
      if (authError.code !== 'auth/popup-closed-by-user') {
        this.erro.set(this.traduzirErro(authError.code));
      }
    } finally {
      this.carregandoGoogle.set(false);
    }
  }

  private traduzirErro(codigo: string): string {
    const mapeamento: Record<string, string> = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/account-exists-with-different-credential': 'Email já registrado com outro método',
      'auth/invalid-credential': 'Credencial inválida',
    };
    return mapeamento[codigo] || 'Erro ao fazer login. Tente novamente.';
  }
}
