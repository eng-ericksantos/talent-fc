import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthError, createUserWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { TranslatePipe } from '@ngx-translate/core';
import { IonApp, IonContent } from '@ionic/angular/standalone';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';

type ViewMode = 'login' | 'register' | 'forgot';

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
    LanguageSelectorComponent,
  ],
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly viewMode = signal<ViewMode>('login');
  readonly formulario: FormGroup;
  readonly carregando = signal(false);
  readonly carregandoGoogle = signal(false);
  readonly erro = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);

  constructor() {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  mudarModo(modo: ViewMode): void {
    this.viewMode.set(modo);
    this.erro.set(null);
    this.sucesso.set(null);
    this.formulario.reset();
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

  async fazerCadastro(): Promise<void> {
    if (this.formulario.invalid) {
      this.erro.set('Por favor, preencha todos os campos corretamente');
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    try {
      const { email, senha } = this.formulario.value;
      await createUserWithEmailAndPassword(this.auth, email, senha);
      this.router.navigateByUrl('/tabs/home');
    } catch (erro) {
      const authError = erro as AuthError;
      this.erro.set(this.traduzirErro(authError.code));
    } finally {
      this.carregando.set(false);
    }
  }

  async recuperarSenha(): Promise<void> {
    const emailControl = this.formulario.get('email');

    if (!emailControl || emailControl.invalid) {
      this.erro.set('Por favor, informe um email válido');
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);
    this.sucesso.set(null);

    try {
      const email = emailControl.value;
      await sendPasswordResetEmail(this.auth, email);
      this.sucesso.set('Um link de recuperação foi enviado para o seu email. Verifique a caixa de entrada e spam.');
      setTimeout(() => {
        this.mudarModo('login');
      }, 3000);
    } catch (erro) {
      const authError = erro as AuthError;
      this.erro.set(this.traduzirErro(authError.code));
    } finally {
      this.carregando.set(false);
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
      'auth/email-already-in-use': 'Este email já está cadastrado',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
      'auth/operation-not-allowed': 'Operação não permitida',
      'auth/invalid-auth-event': 'Email não encontrado no sistema',
    };
    return mapeamento[codigo] || 'Erro ao processar solicitação. Tente novamente.';
  }
}
