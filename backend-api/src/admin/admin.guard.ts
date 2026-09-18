import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requisicao = context.switchToHttp().getRequest();
    const cabecalhoAuth: string = requisicao.headers?.authorization ?? '';

    if (!cabecalhoAuth.startsWith('Bearer ')) {
      throw new ForbiddenException('Token não fornecido.');
    }

    const token = cabecalhoAuth.substring(7);

    try {
      const tokenDecodificado = await getAuth().verifyIdToken(token);

      // Log para debug
      console.log('[AdminGuard] Token decodificado para:', tokenDecodificado.email);
      console.log('[AdminGuard] Custom claims:', tokenDecodificado);

      // Verifica se o usuário tem o custom claim 'admin' definido como true
      if (!tokenDecodificado.admin) {
        console.warn(
          `[AdminGuard] Usuário ${tokenDecodificado.email} não tem claim 'admin'. Claims disponíveis:`,
          Object.keys(tokenDecodificado),
        );
        throw new ForbiddenException(
          'Acesso negado. Usuário não tem permissão de administrador. Contate o suporte.',
        );
      }

      requisicao.usuario = tokenDecodificado;
      return true;
    } catch (erro: any) {
      console.error('[AdminGuard] Erro de autenticação:', erro.message);
      
      if (erro instanceof ForbiddenException) {
        throw erro;
      }
      
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
