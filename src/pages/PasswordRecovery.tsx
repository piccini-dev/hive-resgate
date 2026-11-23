import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Mail, LockKeyhole } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { setAuthCache } from '@/lib/db';
import { BeeLogo } from '@/components/shared/BeeLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Mode = 'checking' | 'request' | 'sent' | 'update' | 'done';
type AuthInit = { mode: 'request' | 'update'; error?: string };

// O destino é a mesma aplicação que pediu a recuperação (Netlify em / ou Pages em /hive-resgate/).
function returnUrl(): string {
  return new URL('alterar-senha', window.location.origin + import.meta.env.BASE_URL).toString();
}

// O cliente usa PKCE com detectSessionInUrl=false; por isso o retorno de recuperação
// deve trocar o code por sessão explicitamente, sem deixar tokens no endereço.
async function inspectRecovery(): Promise<AuthInit> {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  const returnedWithError = url.searchParams.has('error') || hash.has('error');
  const hasCallback = !!(code || tokenHash || accessToken || returnedWithError);
  if (hasCallback) {
    // Limpa o endereço mesmo em caso de erro: não preservar credenciais na barra.
    window.history.replaceState(window.history.state, '', url.pathname);
  }
  if (returnedWithError) {
    return { mode: 'request', error: 'O link expirou ou não pôde ser confirmado. Solicite um novo.' };
  }

  if (code || tokenHash || accessToken) {
    try {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
        if (error) throw error;
      } else if (accessToken && refreshToken) {
        // Compatibilidade com links de recuperação gerados no fluxo implícito.
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) throw error;
      } else {
        return { mode: 'request', error: 'O link está incompleto. Solicite um novo.' };
      }
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error('Sessão de recuperação não confirmada.');
      return { mode: 'update' };
    } catch {
      return { mode: 'request', error: 'Não foi possível validar o link. Solicite outro e abra-o no mesmo navegador em que iniciou a recuperação.' };
    }
  }

  const { data } = await supabase.auth.getUser();
  return { mode: data.user ? 'update' : 'request' };
}

export function PasswordRecovery() {
  const [mode, setMode] = useState<Mode>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Evita consumir o code de uso único duas vezes durante StrictMode.
  const initialization = useRef<Promise<AuthInit> | null>(null);

  useEffect(() => {
    if (!initialization.current) initialization.current = inspectRecovery();
    let active = true;
    void initialization.current
      .then((result) => {
        if (!active) return;
        setError(result.error ?? null);
        setMode(result.mode);
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível verificar o acesso. Tente novamente.');
          setMode('request');
        }
      });
    return () => { active = false; };
  }, []);

  async function requestReset(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: returnUrl(),
      });
      if (authError) throw authError;
      setMode('sent');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível solicitar o e-mail. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas digitadas não coincidem.');
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
      // Não manter a sessão temporária de recuperação após a troca de senha.
      await supabase.auth.signOut({ scope: 'local' });
      setAuthCache(null, null);
      setPassword('');
      setConfirmation('');
      setMode('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível alterar a senha. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-bee-cream via-background to-bee-cream-dark px-6 py-12 dark:from-bee-navy-dark dark:via-background dark:to-bee-navy">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <BeeLogo showTagline />
          <h1 className="mt-6 font-display text-xl font-semibold">Alterar senha da Hive</h1>
        </div>
        <Card className="border-border/60 shadow-lg">
          <CardContent className="space-y-5 p-6">
            {mode === 'checking' && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
                <Loader2 className="h-4 w-4 animate-spin" /> Verificando seu acesso...
              </div>
            )}

            {mode === 'request' && (
              <form onSubmit={requestReset} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Informe o e-mail usado para entrar na Hive. Enviaremos um link para você definir uma nova senha.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="recovery-email">E-mail</Label>
                  <Input id="recovery-email" type="email" autoComplete="email" required autoFocus
                    value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" />
                </div>
                <Button type="submit" variant="accent" className="w-full" disabled={busy || !email.trim()}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Enviar link de recuperação
                </Button>
              </form>
            )}

            {mode === 'sent' && (
              <div className="space-y-3 text-sm" role="status">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                <p className="font-semibold">Confira seu e-mail.</p>
                <p className="text-muted-foreground">
                  Se houver uma conta cadastrada com esse endereço, você receberá instruções para alterar a senha.
                  Verifique também a pasta de spam.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setMode('request')}>
                  Enviar novamente
                </Button>
              </div>
            )}

            {mode === 'update' && (
              <form onSubmit={updatePassword} className="space-y-4">
                <p className="text-sm text-muted-foreground">Defina sua nova senha para entrar na Hive.</p>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input id="new-password" type="password" autoComplete="new-password" minLength={8}
                    required value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8}
                    required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
                </div>
                <Button type="submit" variant="accent" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                  Salvar nova senha
                </Button>
              </form>
            )}

            {mode === 'done' && (
              <div className="space-y-3 text-sm" role="status">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                <p className="font-semibold">Senha alterada com sucesso.</p>
                <p className="text-muted-foreground">Entre novamente na Hive usando sua nova senha.</p>
              </div>
            )}

            {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
