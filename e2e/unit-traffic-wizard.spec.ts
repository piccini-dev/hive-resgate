import { test, expect } from '@playwright/test';
import {
  addDays, addInterest, addLocation, adModeFor, adPreview, budgetTotal, canAdvance, dayToEndIso, dayToStartIso, draftErrors,
  feedUsername, isoToDay, postPreview, problemsByStep, removeInterest, removeLocation, spDay, stepOfError, thumbnailOf, toggleAd, withDefaults,
  type EligiblePost, type WizardState,
} from '../src/lib/traffic-wizard';

const NOW = new Date('2026-11-16T15:00:00Z'); // 12h em São Paulo
const post = (o: Partial<EligiblePost> = {}): EligiblePost => ({
  id: 'p1', title: 'Peça', platform: 'instagram', format: 'image', status: 'approved',
  rendered_slides: { slide2: 'https://x/2.png', slide1: 'https://x/1.png' }, caption: null, published_url: null, published_at: null, ig_media_id: null, ...o,
});
const state = (o: Partial<WizardState> = {}): WizardState => ({
  id: '11111111-1111-1111-1111-111111111111', name: 'Lançamento', objective: 'OUTCOME_ENGAGEMENT', step: 1,
  draft: withDefaults({}, '2026-11-16'), ads: [], ...o,
});

test.describe('unit · traffic-wizard', () => {
  test('datas em São Paulo: dia, soma de dias e ida e volta ISO', () => {
    expect(spDay(new Date('2026-11-17T02:00:00Z'))).toBe('2026-11-16');
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(dayToStartIso('2026-11-17')).toBe('2026-11-17T00:00:00-03:00');
    expect(dayToEndIso('2026-11-17')).toBe('2026-11-17T23:59:00-03:00');
    expect(isoToDay('2026-11-17T23:59:00-03:00')).toBe('2026-11-17');
    expect(isoToDay(null)).toBe('');
    expect(isoToDay('lixo')).toBe('');
  });

  test('padrões: rascunho vazio ganha diário de R$ 20 por 7 dias a partir de amanhã, Brasil e automáticos', () => {
    const d = withDefaults({}, '2026-11-16');
    expect(d).toEqual({
      budget_type: 'daily', amount: 20, starts_at: '2026-11-17T00:00:00-03:00', ends_at: '2026-11-23T23:59:00-03:00', optimization_goal: undefined,
      targeting: { advantage_audience: true, countries: ['BR'], regions: [], cities: [], age_min: 18, age_max: 65, genders: 'all', interests: [] },
      placements: { mode: 'auto', facebook: [], instagram: [] },
    });
  });

  test('padrões preservam o que foi salvo, inclusive término nulo', () => {
    const d = withDefaults({ amount: 50, ends_at: null, targeting: { age_min: 30 } as never }, '2026-11-16');
    expect([d.amount, d.ends_at, d.targeting.age_min, d.targeting.countries]).toEqual([50, null, 30, ['BR']]);
  });

  test('peças: modo, marcar/desmarcar, limite de 5 e miniatura', () => {
    expect(adModeFor({ ig_media_id: '178' })).toBe('ig_post');
    expect(adModeFor({ ig_media_id: null })).toBe('new_creative');
    let ads = toggleAd([], post());
    expect(ads).toEqual([{ post_id: 'p1', mode: 'new_creative', primary_text: '', headline: '', cta: 'LEARN_MORE', link_url: '' }]);
    expect(toggleAd(ads, post())).toEqual([]);
    for (let i = 2; i <= 6; i++) ads = toggleAd(ads, post({ id: `p${i}` }));
    expect(ads.map((a) => a.post_id)).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
    expect(thumbnailOf(post())).toBe('https://x/1.png');
    expect(thumbnailOf(post({ rendered_slides: null }))).toBeNull();
  });

  test('público: país, região e cidade sem duplicar; remover; interesses', () => {
    let t = withDefaults({}, '2026-11-16').targeting;
    t = addLocation(t, { key: 'BR', name: 'Brasil', type: 'country', country_code: 'BR' });
    t = addLocation(t, { key: '460', name: 'São Paulo', type: 'region' });
    t = addLocation(t, { key: '2430536', name: 'Campinas', type: 'city' });
    t = addLocation(t, { key: '2430536', name: 'Campinas', type: 'city' });
    t = addLocation(t, { key: 'x', name: 'Bairro', type: 'neighborhood' });
    expect([t.countries, t.regions, t.cities]).toEqual([['BR'], [{ key: '460', name: 'São Paulo' }], [{ key: '2430536', name: 'Campinas', radius_km: 10 }]]);
    t = removeLocation(removeLocation(t, 'country', 'BR'), 'city', '2430536');
    expect([t.countries, t.cities]).toEqual([[], []]);
    t = addInterest(addInterest(t, { id: '6003', name: 'Liderança' }), { id: '6003', name: 'Liderança' });
    expect(t.interests).toEqual([{ id: '6003', name: 'Liderança' }]);
    expect(removeInterest(t, '6003').interests).toEqual([]);
  });

  test('orçamento: total do diário pelos dias, total direto e diário sem término', () => {
    const d = withDefaults({}, '2026-11-16');
    expect(budgetTotal(d)).toEqual({ total: 140, days: 7 });
    expect(budgetTotal({ ...d, budget_type: 'lifetime', amount: 300 })).toEqual({ total: 300, days: null });
    expect(budgetTotal({ ...d, ends_at: null })).toEqual({ total: null, days: null });
  });

  test('erros vão para o passo certo', () => {
    expect(stepOfError('Escolha ao menos uma peça.')).toBe(1);
    expect(stepOfError('Peça 2: não encontrada ou não aprovada.')).toBe(1);
    expect(stepOfError('Dê um nome à campanha.')).toBe(2);
    expect(stepOfError('A meta de otimização não combina com o objetivo.')).toBe(2);
    expect(stepOfError('Orçamento total precisa de data de término.')).toBe(3);
    expect(stepOfError('O término já passou.')).toBe(3);
    expect(stepOfError('Escolha ao menos um local.')).toBe(4);
    expect(stepOfError('Complete o público e os posicionamentos.')).toBe(4);
    expect(stepOfError('Escolha ao menos um posicionamento.')).toBe(5);
    expect(stepOfError('Peça 1: escreva o texto principal.')).toBe(6);
  });

  test('validação do servidor por passo: sem peça trava o 1; sem link trava só o 6', () => {
    const vazio = draftErrors(state(), [post()], NOW);
    expect(problemsByStep(vazio)[1]).toEqual(['Escolha ao menos uma peça.']);
    expect(canAdvance(1, vazio)).toBe(false);

    const s = state({ ads: toggleAd([], post()) });
    const errs = draftErrors(s, [post()], NOW);
    expect(canAdvance(5, errs)).toBe(true);
    expect(problemsByStep(errs)[6]).toEqual(['Peça 1: escreva o texto principal.', 'Peça 1: informe o link (https) para onde o anúncio leva.']);
    expect(canAdvance(6, errs)).toBe(false);

    const ok = state({ ads: [{ ...s.ads[0], primary_text: 'Texto', link_url: 'https://beeconsulting.com.br' }] });
    expect(draftErrors(ok, [post()], NOW)).toEqual([]);
    expect(canAdvance(7, [])).toBe(true);
  });

  test('post do Instagram em Engajamento não pede texto nem link', () => {
    const ig = post({ ig_media_id: '178', rendered_slides: null, status: 'published' });
    expect(draftErrors(state({ ads: toggleAd([], ig) }), [ig], NOW)).toEqual([]);
  });


  test('postPreview: slides em ordem, legenda do post e sem botão', () => {
    expect(postPreview({ rendered_slides: { slide2: 'b', slide1: 'a' }, caption: 'Oi' })).toEqual({
      slides: ['a', 'b'], caption: 'Oi', cta: null,
    });
  });

  test('adPreview: impulsionar usa a legenda do post e só tem botão em Tráfego', () => {
    const ad = { mode: 'ig_post' as const, primary_text: 'X', cta: 'LEARN_MORE' as const };
    const piece = { rendered_slides: null, caption: 'Legenda' };
    expect(adPreview(ad, piece, 'OUTCOME_ENGAGEMENT')).toEqual({ slides: [], caption: 'Legenda', cta: null });
    expect(adPreview(ad, piece, 'OUTCOME_TRAFFIC')).toEqual({ slides: [], caption: 'Legenda', cta: 'Saiba mais' });
  });

  test('adPreview: criativo novo usa o texto principal e sempre tem botão', () => {
    const ad = { mode: 'new_creative' as const, primary_text: 'Texto', cta: 'SIGN_UP' as const };
    const piece = { rendered_slides: { slide1: 'a' }, caption: 'Legenda' };
    expect(adPreview(ad, piece, 'OUTCOME_ENGAGEMENT')).toEqual({ slides: ['a'], caption: 'Texto', cta: 'Cadastre-se' });
    expect(adPreview(ad, piece, null)).toEqual({ slides: ['a'], caption: 'Texto', cta: 'Cadastre-se' });
  });

  test('adPreview: legenda nula vira texto vazio', () => {
    expect(adPreview(
      { mode: 'ig_post', primary_text: 'Outro texto', cta: 'LEARN_MORE' },
      { rendered_slides: null, caption: null },
      'OUTCOME_ENGAGEMENT',
    )).toEqual({ slides: [], caption: '', cta: null });
    expect(postPreview({ rendered_slides: null, caption: null })).toEqual({ slides: [], caption: '', cta: null });
  });

  test('feedUsername: tira @ e espaços; vazio vira sua_conta', () => {
    expect(feedUsername(' @marcos ')).toBe('marcos');
    expect(feedUsername('@_marcospiccini1')).toBe('_marcospiccini1');
    expect(feedUsername('')).toBe('sua_conta');
    expect(feedUsername(' @ ')).toBe('sua_conta');
    expect(feedUsername(null)).toBe('sua_conta');
    expect(feedUsername(undefined)).toBe('sua_conta');
  });
});
