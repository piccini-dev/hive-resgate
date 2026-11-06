// Configuracoes do user.
// Abas: Perfil, Contas e Integrações.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Loader2, Save, Sparkles, User as UserIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { edge } from '@/lib/edge';
import { toast } from 'sonner';
import { AccountsPanel, IG_ACCOUNT_STATE_KEY } from '@/components/settings/AccountsPanel';

export function SettingsPage() {
  const { currentUser, settings, updateProfile, updateSettings } = useAuthStore();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [geminiKey, setGeminiKey] = useState(settings?.gemini_api_key ?? '');
  const [openaiKey, setOpenaiKey] = useState(settings?.openai_api_key ?? '');
  const [serpKey, setSerpKey] = useState(settings?.serpapi_key ?? '');
  const [linkedinToken, setLinkedinToken] = useState(settings?.linkedin_token ?? '');
  const [linkedinAuthorUrn, setLinkedinAuthorUrn] = useState(settings?.linkedin_author_urn ?? '');
  const [igAccessToken, setIgAccessToken] = useState(settings?.instagram_access_token ?? '');
  const [igBusinessId, setIgBusinessId] = useState(settings?.instagram_business_account_id ?? '');
  const [saving, setSaving] = useState(false);
  const [testingLi, setTestingLi] = useState(false);
  const [testingIg, setTestingIg] = useState(false);
  const [connectingIg, setConnectingIg] = useState(false);
  // Perfis IG vinculados + token pendente (quando há mais de um, o usuário escolhe).
  type IgAccount = { instagram_business_account_id: string; username: string; page_name: string };
  const [igAccounts, setIgAccounts] = useState<IgAccount[]>([]);
  const [igPending, setIgPending] = useState<{ access_token: string; expires_at: string } | null>(null);

  // --- Conectar Instagram (Login com Facebook) ---
  // App ID do Facebook é PÚBLICO (vai na URL do OAuth). Default embutido pra o
  // deploy (Netlify) funcionar sem env var; pode sobrescrever com VITE_FACEBOOK_APP_ID.
  const FB_APP_ID = (import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined) || '2082883022288225';
  const igRedirectUri = typeof window !== 'undefined' ? `${window.location.origin}/configuracoes` : '';
  const igExpiresAt = settings?.instagram_token_expires_at;

  function startInstagramOAuth() {
    if (!FB_APP_ID) { toast.error('Configure VITE_FACEBOOK_APP_ID no ambiente do app antes de conectar.'); return; }
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('ig_oauth_state', state);
    // instagram_manage_insights: alcance, salvos e compartilhamentos por post (Desempenho).
    // instagram_manage_comments: texto dos comentários (sinal da audiência para a ACJ).
    const scope = 'instagram_basic,instagram_content_publish,instagram_manage_insights,instagram_manage_comments,pages_show_list,pages_read_engagement,business_management';
    window.location.href =
      `https://www.facebook.com/v21.0/dialog/oauth?client_id=${FB_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(igRedirectUri)}&state=${state}&response_type=code&scope=${encodeURIComponent(scope)}`;
  }

  // Salva o perfil IG escolhido (token longo + business id + validade).
  async function saveIgAccount(acc: IgAccount, token: string, expiresAt: string) {
    await updateSettings({
      instagram_access_token: token,
      instagram_business_account_id: acc.instagram_business_account_id,
      instagram_token_expires_at: expiresAt,
    });
    setIgAccessToken(token);
    setIgBusinessId(acc.instagram_business_account_id);
    toast.success(`Instagram conectado · @${acc.username || acc.page_name}`);
  }

  // Retorno do OAuth (?code&state) -> troca por token longo e salva.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code'); const state = params.get('state');
    const saved = sessionStorage.getItem('ig_oauth_state');
    if (!code || !state || state !== saved) return;
    sessionStorage.removeItem('ig_oauth_state');
    (async () => {
      setConnectingIg(true);
      try {
        const res = await edge.connectInstagram({ code, redirect_uri: igRedirectUri });
        const accounts = res.accounts ?? [];
        setIgAccounts(accounts);
        setIgPending({ access_token: res.access_token, expires_at: res.expires_at });
        if (accounts.length === 1) {
          await saveIgAccount(accounts[0], res.access_token, res.expires_at);
        } else {
          toast.success(`${accounts.length} perfis encontrados — escolha qual usar.`);
        }
      } catch (e) {
        toast.error(`Falha ao conectar: ${(e as Error).message.slice(0, 200)}`);
      } finally {
        setConnectingIg(false);
        window.history.replaceState({}, '', '/configuracoes');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setName(currentUser?.name ?? '');
    setGeminiKey(settings?.gemini_api_key ?? '');
    setOpenaiKey(settings?.openai_api_key ?? '');
    setSerpKey(settings?.serpapi_key ?? '');
    setLinkedinToken(settings?.linkedin_token ?? '');
    setLinkedinAuthorUrn(settings?.linkedin_author_urn ?? '');
    setIgAccessToken(settings?.instagram_access_token ?? '');
    setIgBusinessId(settings?.instagram_business_account_id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, settings?.user_id]);

  if (!currentUser) return null;

  async function handleSaveProfile() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success('Perfil atualizado');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveIntegrations() {
    setSaving(true);
    try {
      await updateSettings({
        gemini_api_key: geminiKey,
        openai_api_key: openaiKey,
        serpapi_key: serpKey,
        linkedin_token: linkedinToken,
        linkedin_author_urn: linkedinAuthorUrn,
        instagram_access_token: igAccessToken,
        instagram_business_account_id: igBusinessId,
      });
      toast.success('Integracoes salvas');
    } finally {
      setSaving(false);
    }
  }

  // Testa o token chamando o endpoint /me da plataforma.
  async function handleTestLinkedIn() {
    if (!linkedinToken) {
      toast.error('Cola o token primeiro.');
      return;
    }
    setTestingLi(true);
    try {
      // Valida no SERVIDOR (edge function): o LinkedIn não manda CORS, então
      // chamar api.linkedin.com direto do navegador é bloqueado.
      const data = await edge.testLinkedIn({ token: linkedinToken });
      const suggestedUrn = data.suggested_urn;
      toast.success(`LinkedIn OK · ${data.name ?? data.email ?? data.sub}${suggestedUrn ? ` · URN sugerido: ${suggestedUrn}` : ''}`);
      if (!linkedinAuthorUrn && suggestedUrn) setLinkedinAuthorUrn(suggestedUrn);
    } catch (e) {
      toast.error(`LinkedIn falhou: ${(e as Error).message.slice(0, 200)}`);
    } finally {
      setTestingLi(false);
    }
  }

  async function handleTestInstagram() {
    if (!igAccessToken || !igBusinessId) {
      toast.error('Cola o access_token E o business_account_id primeiro.');
      return;
    }
    setTestingIg(true);
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${igBusinessId}?fields=username,name&access_token=${encodeURIComponent(igAccessToken)}`,
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success(`Instagram OK · @${data.username ?? data.name ?? igBusinessId}`);
    } catch (e) {
      toast.error(`Instagram falhou: ${(e as Error).message.slice(0, 200)}`);
    } finally {
      setTestingIg(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Configuracoes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Perfil, contas e integrações.</p>
      </header>

      {/* Volta do OAuth de uma conta (Contas) abre direto na aba Contas. */}
      <Tabs defaultValue={typeof window !== 'undefined' && sessionStorage.getItem(IG_ACCOUNT_STATE_KEY) ? 'accounts' : 'profile'}>
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="integrations">Integracoes</TabsTrigger>
        </TabsList>

        {/* ============ CONTAS ============ */}
        <TabsContent value="accounts" className="space-y-4">
          <AccountsPanel />
        </TabsContent>

        {/* ============ PERFIL ============ */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> Perfil</CardTitle>
              <CardDescription>Seus dados de usuario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="text-sm">{currentUser.email}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Funcao</div>
                <div><Badge variant="secondary" className="capitalize">{currentUser.role}</Badge></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Link to="/alterar-senha" className="text-sm underline">Alterar minha senha</Link>
                <Button onClick={handleSaveProfile} disabled={saving || name === currentUser.name || !name.trim()} variant="accent">
                  <Save className="h-4 w-4" /> Salvar perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ INTEGRACOES ============ */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chaves de API</CardTitle>
              <CardDescription>Gemini pra IA, SerpAPI opcional pra busca.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini">Chave Gemini API</Label>
                <Input id="gemini" type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIzaSy..." />
                <p className="text-xs text-muted-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  Usada pra texto, imagens, embeddings e transcrição de vídeo.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openai">Chave OpenAI (opcional)</Label>
                <Input id="openai" type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." />
                <p className="text-xs text-muted-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  Pra testar os modelos de imagem GPT (gpt-image-2.5). Só necessária durante a comparação de modelos.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serp">Chave SerpAPI (opcional)</Label>
                <Input id="serp" type="password" value={serpKey} onChange={(e) => setSerpKey(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="rounded bg-[#0a66c2] px-1.5 py-0.5 text-[10px] font-bold text-white">in</span>
                LinkedIn (publicação direta)
              </CardTitle>
              <CardDescription>
                Token gerado no LinkedIn Developer (scope w_member_social) + URN do autor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="li-token">Access Token</Label>
                <Input id="li-token" type="password" value={linkedinToken} onChange={(e) => setLinkedinToken(e.target.value)} placeholder="AQX..." />
                <p className="text-[10px] text-muted-foreground">Valido por 60 dias. Quando expirar, gera outro no Developer Portal.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="li-urn">Author URN</Label>
                <Input id="li-urn" value={linkedinAuthorUrn} onChange={(e) => setLinkedinAuthorUrn(e.target.value)} placeholder="urn:li:person:XXXX ou urn:li:organization:YYYY" />
                <p className="text-[10px] text-muted-foreground">
                  Clica "Testar" abaixo pra detectar automaticamente o URN da sua conta pessoal.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleTestLinkedIn} disabled={testingLi}>
                  {testingLi ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Testar conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="rounded bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] px-1.5 py-0.5 text-[10px] font-bold text-white">IG</span>
                Instagram (publicação direta)
              </CardTitle>
              <CardDescription>
                Conta Business/Creator vinculada a uma Facebook Page. Token long-lived da Graph API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Conectar com 1 clique (Login com Facebook) */}
              <div className="rounded-lg border border-border bg-card/40 p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm">
                    <div className="font-semibold">Conectar com Facebook</div>
                    <div className="text-[11px] text-muted-foreground">Pega o token e o ID sozinho — e renova automático (a cada ~50 dias).</div>
                  </div>
                  <Button size="sm" variant="accent" onClick={startInstagramOAuth} disabled={connectingIg || !FB_APP_ID}>
                    {connectingIg ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                    {settings?.instagram_access_token ? 'Reconectar Instagram' : 'Conectar Instagram'}
                  </Button>
                </div>
                {settings?.instagram_access_token && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Conectado
                    {igExpiresAt ? ` · token válido até ${new Date(igExpiresAt).toLocaleDateString('pt-BR')}` : ''}
                  </div>
                )}
                {igAccounts.length > 1 && igPending && (
                  <div className="mt-1 space-y-1.5">
                    <div className="text-[11px] font-medium text-muted-foreground">Escolha o perfil pra publicar:</div>
                    <div className="grid gap-1.5">
                      {igAccounts.map((a) => {
                        const active = igBusinessId === a.instagram_business_account_id;
                        return (
                          <button
                            key={a.instagram_business_account_id}
                            onClick={() => void saveIgAccount(a, igPending.access_token, igPending.expires_at)}
                            className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs ${active ? 'border-accent bg-accent/10' : 'border-border hover:bg-secondary/40'}`}
                          >
                            <span>@{a.username || a.page_name} <span className="text-muted-foreground">· {a.page_name}</span></span>
                            {active ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : null}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Clique pra alternar o perfil ativo. (Publica no perfil marcado.)</p>
                  </div>
                )}
                {!FB_APP_ID && (
                  <p className="text-[11px] text-amber-600">Defina <code>VITE_FACEBOOK_APP_ID</code> no ambiente e registre <code>{igRedirectUri}</code> como Valid OAuth Redirect URI no app da Meta.</p>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground">Ou preencha manualmente:</p>
              <div className="space-y-2">
                <Label htmlFor="ig-token">Access Token</Label>
                <Input id="ig-token" type="password" value={igAccessToken} onChange={(e) => setIgAccessToken(e.target.value)} placeholder="EAAxxxxx..." />
                <p className="text-[10px] text-muted-foreground">Page access token long-lived (nao expira se gerado via System User).</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ig-id">IG Business Account ID</Label>
                <Input id="ig-id" value={igBusinessId} onChange={(e) => setIgBusinessId(e.target.value)} placeholder="17841..." />
                <p className="text-[10px] text-muted-foreground">
                  Pegue via Graph Explorer: GET /me/accounts → GET /{'{page_id}'}?fields=instagram_business_account
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleTestInstagram} disabled={testingIg}>
                  {testingIg ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Testar conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveIntegrations} disabled={saving} variant="accent">
              <Save className="h-4 w-4" /> Salvar tudo
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
