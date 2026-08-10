import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requisicao = context.switchToHttp().getRequest();
    const cabecalhoAuth: string = requisicao.headers?.authorization ?? '';

    if (!cabecalhoAuth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido.');
    }

    const token = cabecalhoAuth.substring(7);

    try {
      const tokenDecodificado = await admin.auth().verifyIdToken(token);
      requisicao.usuario = tokenDecodificado;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
