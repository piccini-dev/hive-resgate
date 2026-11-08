import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { rememberNext } from '@/lib/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore, needsOnboarding } from '@/store/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { NewPost } from '@/pages/posts/NewPost';
import { PostEditor } from '@/pages/posts/PostEditor';
import { Biblioteca } from '@/pages/biblioteca/Biblioteca';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { OnboardingWizard } from '@/pages/onboarding/OnboardingWizard';
import { KnowledgeBase } from '@/pages/conhecimento/KnowledgeBase';
import { Editoriais } from '@/pages/editoriais/Editoriais';
import { Curadoria } from '@/pages/curadoria/Curadoria';
import { Podcasts } from '@/pages/podcasts/Podcasts';
import { NewPodcastClip } from '@/pages/podcasts/NewPodcastClip';
import { Templates } from '@/pages/templates/Templates';
import { TemplateEditor } from '@/pages/templates/TemplateEditor';
import { ComoEscrevo } from '@/pages/genesis/ComoEscrevo';
import { IdentityConfigure, IdentityHome } from '@/pages/identidade/IdentityHome';
import { ProfileDetail } from '@/pages/identidade/ProfileDetail';
import { SetupSessionPage } from '@/pages/identidade/SetupSessionPage';
import { Coach } from '@/pages/coach/Coach';
import { Agenda } from '@/pages/agenda/Agenda';
import { HivePreview } from '@/pages/hive/HivePreview';
import { HiveAssets } from '@/pages/hive/HiveAssets';
import { FotosDoMarcos } from '@/pages/hive/FotosDoMarcos';
import { HiveConvite } from '@/pages/hive/HiveConvite';
import { Custos } from '@/pages/custos/Custos';
import { OlharCalibracao } from '@/pages/olhar/Calibracao';
import { Pipeline } from '@/pages/pipeline/Pipeline';
import { Resultados } from '@/pages/desempenho/Resultados';
import { AccountsCompare } from '@/pages/desempenho/AccountsCompare';
import { OneContent } from '@/pages/criar/OneContent';
import { CreateHub } from '@/pages/criar/CreateHub';
import { Campaigns } from '@/pages/campanhas/Campaigns';
import { NewCampaign } from '@/pages/campanhas/NewCampaign';
import { CampaignDetail } from '@/pages/campanhas/CampaignDetail';
import { Production } from '@/pages/producao/Production';

// Link de tarefa aberto sem sessão (doc 04 §12): o destino vai junto para o login e é retomado depois de
// entrar (e depois do gate de configuração, se houver) — validado como rota interna; a autorização do
// objeto continua sendo conferida pela própria tela.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, settings, initialized } = useAuthStore();
  const loc = useLocation();
  if (!initialized) return null;
  const here = `${loc.pathname}${loc.search}`;
  if (!currentUser) return <Navigate to={here === '/' ? '/login' : `/login?next=${encodeURIComponent(here)}`} replace />;
  if (needsOnboarding(settings)) { rememberNext(here); return <Navigate to="/onboarding" replace />; }
  return <>{children}</>;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { currentUser, initialized } = useAuthStore();
  if (!initialized) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { init, initialized } = useAuthStore();

  useEffect(() => {
    void init();
  }, [init]);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Editor de templates: tela cheia, fora do AppShell (precisa da largura).
            O editor de post continua embutido no PostEditor. */}
        <Route
          path="/templates/:id"
          element={
            <ProtectedRoute>
              <TemplateEditor />
            </ProtectedRoute>
          }
        />
        {/* O /editor solto virou o editor de templates. */}
        <Route path="/editor" element={<Navigate to="/templates" replace />} />
        <Route
          path="/onboarding"
          element={
            <OnboardingGate>
              <OnboardingWizard />
            </OnboardingGate>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="genesis" element={<ComoEscrevo />} />
          <Route path="diretrizes" element={<Navigate to="/genesis?aba=oficio" replace />} />
          <Route path="identidade" element={<IdentityHome />} />
          <Route path="identidade/configurar" element={<IdentityConfigure />} />
          <Route path="identidade/sessoes/:id" element={<SetupSessionPage />} />
          <Route path="identidade/perfis/:id" element={<ProfileDetail />} />
          <Route path="alma" element={<Navigate to="/genesis" replace />} />
          <Route path="templates" element={<Templates />} />
          <Route path="aprendizado" element={<Navigate to="/coach?aba=licoes" replace />} />
          <Route path="jornada" element={<Navigate to="/desempenho?aba=acj" replace />} />
          <Route path="coach" element={<Coach />} />
          <Route path="feedback" element={<Navigate to="/coach?aba=observacoes" replace />} />
          <Route path="personas" element={<Navigate to="/" replace />} />
          {/* O kanban virou o Dashboard — links antigos pra /posts caem la. */}
          <Route path="posts" element={<Navigate to="/" replace />} />
          <Route path="posts/novo" element={<NewPost />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="desempenho" element={<Resultados />} />
          <Route path="desempenho/contas" element={<AccountsCompare />} />
          <Route path="hive/preview" element={<HivePreview />} />
          <Route path="hive/assets" element={<HiveAssets />} />
          <Route path="hive/marcos" element={<Navigate to="/hive/fotografia?aba=reais" replace />} />
          <Route path="hive/fotografia" element={<FotosDoMarcos />} />
          <Route path="hive/convite" element={<HiveConvite />} />
          <Route path="hive/teste-m02" element={<Navigate to="/" replace />} />
          <Route path="hive/teste-m01" element={<Navigate to="/" replace />} />
          <Route path="custos" element={<Custos />} />
          <Route path="olhar/calibracao" element={<OlharCalibracao />} />
          <Route path="labs/imagens" element={<Navigate to="/" replace />} />
          <Route path="criar" element={<CreateHub />} />
          <Route path="criar/conteudo" element={<OneContent />} />
          <Route path="campanhas" element={<Campaigns />} />
          <Route path="campanhas/nova" element={<NewCampaign />} />
          <Route path="campanhas/:id" element={<CampaignDetail />} />
          <Route path="producao" element={<Production />} />
          {/* Vídeo virou parte do wizard (NewPost). Rota antiga redireciona. */}
          <Route path="posts/novo-video" element={<Navigate to="/posts/novo" replace />} />
          <Route path="podcasts" element={<Podcasts />} />
          <Route path="podcasts/novo" element={<NewPodcastClip />} />
          <Route path="posts/:id" element={<PostEditor />} />
          <Route path="produtos" element={<Navigate to="/identidade" replace />} />
          <Route path="editoriais" element={<Editoriais />} />
          <Route path="arsenal" element={<Navigate to="/editoriais?aba=arsenal" replace />} />
          <Route path="curadoria" element={<Curadoria />} />
          {/* Linhas editoriais foram encerradas no cutover (D11): a estrutura agora é Campanhas. */}
          <Route path="linhas" element={<Navigate to="/campanhas" replace />} />
          <Route path="biblioteca" element={<Biblioteca />} />
          <Route path="conhecimento" element={<KnowledgeBase />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}
