import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Apenas interceptar requisições para a nossa API
  if (!req.url.includes(environment.apiUrl)) {
    return next(req);
  }

  const auth = inject(Auth);
  const usuario = auth.currentUser;

  if (!usuario) {
    return next(req);
  }

  return from(usuario.getIdToken()).pipe(
    switchMap((token) => {
      const reqAutenticada = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(reqAutenticada);
    }),
  );
};
