// Verdadeiro só quando o ambiente é o site de teste do hive-resgate.
export function isTestEnv(env: string | undefined): boolean {
  return env?.trim().toLowerCase() === 'teste';
}

// Faixa de aviso; devolve null fora do site de teste.
export function EnvBanner() {
  const env = import.meta.env.VITE_APP_ENV as string | undefined;
  if (!isTestEnv(env)) return null;

  return (
    <div
      role="status"
      data-testid="env-banner"
      className="shrink-0 bg-amber-500 px-3 py-1.5 text-center text-xs font-semibold text-black sm:text-sm"
    >
      Versão de teste — usa os dados reais da Bee: aprovar, agendar e publicar valem de verdade.
    </div>
  );
}
