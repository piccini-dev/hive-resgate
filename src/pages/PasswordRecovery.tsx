import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BeeLogo } from '@/components/shared/BeeLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

function PasswordCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-bee-cream via-background to-bee-cream-dark px-6 py-12 dark:from-bee-navy-dark dark:via-background dark:to-bee-navy">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><BeeLogo showTagline /></div>
        <Card className="border-border/60 shadow-lg"><CardContent className="space-y-4 p-6">{children}</CardContent></Card>
      </div>
    </div>
  );
}

function PasswordError({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p>{message}</p>
    </div>
  );
}

export function PasswordRecoveryRequest() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function requestRecovery(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/alterar-senha`,
      });
      if (requestError) throw requestError;
      setSent(true);
    } catch {
      setError('Não foi possível enviar o link. Tente novamente em alguns instantes.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PasswordCard>
      <h1 className="font-display text-xl font-semibold">Recuperar senha</h1>
      {sent ? (
        <div role="status" className="space-y-3 text-sm">
          <p>Se este email estiver cadastrado, você receberá um link para definir uma nova senha.</p>
          <p className="text-muted-foreground">Verifique também o spam. Abra o link neste mesmo navegador, onde você fez a solicitação.</p>
        </div>
      ) : (
        <form onSubmit={requestRecovery} className="space-y-4">
          <p className="text-sm text-muted-foreground">Informe o email da sua conta na Hive.</p>
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email</Label>
            <Input id="recovery-email" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <PasswordError message={error} />}
          <Button type="submit" variant="accent" className="w-full" disabled={busy || !email.trim()}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}Enviar link de recuperação
          </Button>
        </form>
      )}
      <Link to="/login" className="inline-block text-sm text-muted-foreground underline">Voltar para o login</Link>
    </PasswordCard>
  );
}

// O cliente principal não processa URLs de autenticação automaticamente. A troca acontece
// apenas nesta rota, antes de qualquer bootstrap de perfil/configuração ou gate de onboarding.
async function passwordSession() {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const code = url.searchParams.get('code');
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  const invalidLink = url.searchParams.has('error') || hash.has('error');
  const hasCredentials = !!(code || url.hash || url.search);

  // Não mantenha códigos/tokens na barra, no histórico ou em links de saída.
  if (hasCredentials) window.history.replaceState(window.history.state, '', url.pathname);
  if (invalidLink) throw new Error('invalid_recovery');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else if (accessToken || refreshToken) {
    // Compatibilidade com links administrativos de recuperação (fluxo implícito).
    if (!accessToken || !refreshToken || hash.get('type') !== 'recovery') throw new Error('invalid_recovery');
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw error;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) throw error ?? new Error('missing_session');
  return { id: data.user.id, email: data.user.email };
}

export function ChangePassword() {
  const verification = useRef<ReturnType<typeof passwordSession> | null>(null);
  const [account, setAccount] = useState<{ id: string; email: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    // StrictMode pode executar o efeito duas vezes; o código de uso único só pode ser trocado uma vez.
    verification.current ??= passwordSession();
    void verification.current.then((user) => {
      if (active) setAccount(user);
    }).catch(() => {
      if (active) setInvalid(true);
    }).finally(() => {
      if (active) setChecking(false);
    });
    return () => { active = false; };
  }, []);

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !account) return;
    setError('');
    if (password !== confirmation) { setError('As senhas precisam ser iguais.'); return; }
    setBusy(true);
    try {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || data.user?.id !== account.id) { setInvalid(true); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword('');
      setConfirmation('');
      setSaved(true);
    } catch {
      setError('Não foi possível alterar a senha. Use uma senha diferente da atual, com pelo menos 8 caracteres. Se o problema continuar, solicite um novo link.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PasswordCard>
      <h1 className="font-display text-xl font-semibold">Alterar minha senha</h1>
      {checking ? (
        <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Verificando seu acesso...</p>
      ) : invalid ? (
        <div className="space-y-4">
          <PasswordError message="Entre na sua conta ou solicite um novo link de recuperação. Este acesso não está disponível ou expirou." />
          <Link to="/recuperar-senha" className="inline-block text-sm underline">Solicitar novo link</Link>
        </div>
      ) : saved ? (
        <div role="status" className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Sua senha foi alterada.</div>
      ) : (
        <form onSubmit={savePassword} className="space-y-4">
          <p className="break-all text-sm text-muted-foreground">Conta: {account?.email}</p>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="text-xs text-muted-foreground">Use pelo menos 8 caracteres.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          </div>
          {error && <PasswordError message={error} />}
          <Button type="submit" variant="accent" className="w-full" disabled={busy || password.length < 8 || confirmation.length < 8}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}Salvar nova senha
          </Button>
        </form>
      )}
      <Link to="/login" className="inline-block text-sm text-muted-foreground underline">{saved ? 'Entrar na Hive' : 'Voltar para o login'}</Link>
    </PasswordCard>
  );
}
