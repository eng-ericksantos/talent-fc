import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/admin/trigger-worker')) {
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
