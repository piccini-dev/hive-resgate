// Onboarding: um passo, a chave do Gemini (é o que libera o app; ver needsOnboarding).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Key, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { takeNext } from '@/lib/navigation';

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useAuthStore();

  const [geminiKey, setGeminiKey] = useState(settings?.gemini_api_key ?? '');
  const [saving, setSaving] = useState(false);

  async function saveAndNext() {
    if (!geminiKey || geminiKey.length < 10) {
      toast.error('Cola sua chave Gemini API.');
      return;
    }
    setSaving(true);
    try {
      await updateSettings({ gemini_api_key: geminiKey });
      toast.success('Pronto. Vamos cocriar.');
      navigate(takeNext() ?? '/');
    } catch (e) {
      console.error(e);
      toast.error('Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Bem-vindo a Bee Consulting
          </h1>
          <p className="text-sm text-muted-foreground">
            Falta só a chave do Gemini para a Hive começar a escrever.
          </p>
        </header>

        <Card>
          <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Cola sua chave Gemini API
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Modelo padrão: <strong>gemini-3.1-pro-preview</strong>. Embedding: <strong>gemini-embedding-001</strong>.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gemini">Chave</Label>
                  <Input
                    id="gemini"
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pega no <a className="text-accent underline" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>.
                  </p>
                </div>
                <div className="rounded-md border border-accent/30 bg-accent/5 p-3 text-xs text-muted-foreground">
                  <Key className="mb-1 inline h-3 w-3 mr-1 text-accent" />
                  Voce paga o uso direto pro Google. A plataforma só envia os prompts em nome da sua chave.
                </div>
              </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="accent"
                onClick={saveAndNext}
                disabled={saving}
              >
                Finalizar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
