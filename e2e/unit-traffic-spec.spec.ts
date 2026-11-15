import { test, expect } from '@playwright/test';
import {
  optimizationGoal,
  slideUrls,
  validateDraft,
  buildTargeting,
  campaignPayload,
  adsetPayload,
  creativePayload,
  adPayload,
  withUtm,
  type CampaignRow,
  type AdRow,
  type PostRow,
} from '../supabase/functions/_shared/traffic-spec';

const NOW = new Date('2026-11-15T12:00:00Z');
const base = (): CampaignRow => ({
  id: '11111111-1111-1111-1111-111111111111', name: 'Lançamento', objective: 'OUTCOME_TRAFFIC',
  draft: {
    budget_type: 'daily', amount: 30.5, starts_at: '2026-11-16T12:00:00Z', ends_at: '2026-11-21T12:00:00Z',
    targeting: { advantage_audience: false, countries: ['BR'], regions: [], cities: [], age_min: 25, age_max: 55, genders: 'all', interests: [] },
    placements: { mode: 'auto', facebook: [], instagram: [] },
  },
});
const ad = (o: Partial<AdRow> = {}): AdRow => ({ id: 'a1', post_id: 'p1', mode: 'new_creative', primary_text: 'Texto', headline: 'Título', cta: 'LEARN_MORE', link_url: 'https://beeconsulting.com.br/curso', ...o });
const post = (o: Partial<PostRow> = {}): PostRow => ({ id: 'p1', format: 'image', ig_media_id: null, rendered_slides: { slide1: 'https://x/1.png' }, ...o });
const IDS = { ad_account_id: 'act_1', page_id: 'pg1', ig_user_id: 'ig1' };

test.describe('unit · traffic-spec', () => {
  test('objetivos: meta padrão, override permitido e override incompatível', () => {
    expect(optimizationGoal('OUTCOME_TRAFFIC')).toBe('LINK_CLICKS');
    expect(optimizationGoal('OUTCOME_TRAFFIC', 'LANDING_PAGE_VIEWS')).toBe('LANDING_PAGE_VIEWS');
    expect(optimizationGoal('OUTCOME_ENGAGEMENT', 'LINK_CLICKS')).toBe('POST_ENGAGEMENT');
  });

  test('slides: ordenação numérica, exclusão de chaves inválidas/vazias e nulo', () => {
    expect(slideUrls({ slide10: 'j', slide2: 'b', slide1: 'a', cover: 'x', slide3: '' })).toEqual(['a', 'b', 'j']);
    expect(slideUrls(null)).toEqual([]);
  });

  test('rascunho válido não tem erros', () => {
    expect(validateDraft(base(), [ad()], [post()], NOW)).toEqual([]);
  });

  test('orçamento total sem término é recusado', () => {
    const c = base();
    c.draft.budget_type = 'lifetime';
    c.draft.ends_at = null;
    expect(validateDraft(c, [ad()], [post()], NOW)).toContain('Orçamento total precisa de data de término.');
  });

  test('término antes do início é recusado', () => {
    const c = base();
    c.draft.ends_at = '2026-11-15T12:00:00Z';
    expect(validateDraft(c, [ad()], [post()], NOW)).toContain('O término precisa ser depois do início.');
  });

  test('idade mínima maior que 65 é recusada', () => {
    const c = base();
    c.draft.targeting.age_min = 70;
    expect(validateDraft(c, [ad()], [post()], NOW)).toContain('A idade vai de 18 a 65, e a mínima não pode passar da máxima.');
  });

  test('sem país, região ou cidade é recusado', () => {
    const c = base();
    c.draft.targeting.countries = [];
    c.draft.targeting.regions = [];
    c.draft.targeting.cities = [];
    expect(validateDraft(c, [ad()], [post()], NOW)).toContain('Escolha ao menos um local.');
  });

  test('posicionamento manual sem plataformas é recusado', () => {
    const c = base();
    c.draft.placements = { mode: 'manual', facebook: [], instagram: [] };
    expect(validateDraft(c, [ad()], [post()], NOW)).toContain('Escolha ao menos um posicionamento.');
  });

  test('campanha sem anúncios é recusada', () => {
    expect(validateDraft(base(), [], [post()], NOW)).toContain('Escolha ao menos uma peça.');
  });

  test('campanha com seis anúncios é recusada', () => {
    const ads = Array.from({ length: 6 }, (_, i) => ad({ id: 'a' + (i + 1) }));
    expect(validateDraft(base(), ads, [post()], NOW)).toContain('No máximo 5 peças por campanha.');
  });

  test('post do Instagram sem publicação é recusado', () => {
    expect(validateDraft(base(), [ad({ mode: 'ig_post' })], [post({ ig_media_id: null })], NOW))
      .toContain('Peça 1: só pode ser impulsionada depois de publicada no Instagram.');
  });

  test('link sem https é recusado', () => {
    expect(validateDraft(base(), [ad({ link_url: 'http://x.com' })], [post()], NOW))
      .toContain('Peça 1: informe o link (https) para onde o anúncio leva.');
  });

  test('vídeo novo sem publicação no Instagram é recusado', () => {
    expect(validateDraft(base(), [ad()], [post({ format: 'reel' })], NOW))
      .toContain('Peça 1: vídeo só pode ser anunciado depois de publicado no Instagram.');
  });

  test('peça inexistente ou não aprovada é recusada', () => {
    expect(validateDraft(base(), [ad({ post_id: 'outra' })], [post()], NOW))
      .toContain('Peça 1: não encontrada ou não aprovada.');
  });

  test('nome vazio, objetivo ausente, orçamento inválido e início inválido são recusados', () => {
    const c = base();
    c.name = '  ';
    c.objective = null;
    c.draft.amount = 0;
    c.draft.starts_at = 'não é uma data';
    const errors = validateDraft(c, [ad()], [post()], NOW);
    expect(errors).toContain('Dê um nome à campanha.');
    expect(errors).toContain('Escolha o objetivo da campanha.');
    expect(errors).toContain('O orçamento precisa ser maior que zero.');
    expect(errors).toContain('Informe o início da campanha.');
  });

  test('meta incompatível e término que já passou são recusados', () => {
    const c = base();
    c.draft.optimization_goal = 'POST_ENGAGEMENT';
    c.draft.starts_at = '2026-11-10T12:00:00Z';
    c.draft.ends_at = '2026-11-14T12:00:00Z';
    const errors = validateDraft(c, [ad()], [post()], NOW);
    expect(errors).toContain('A meta de otimização não combina com o objetivo.');
    expect(errors).toContain('O término já passou.');
  });

  test('botão inválido, arte ausente e texto principal vazio são recusados', () => {
    const errors = validateDraft(base(), [ad({ cta: 'INVÁLIDO' as AdRow['cta'], primary_text: '  ' })], [post({ rendered_slides: null })], NOW);
    expect(errors).toContain('Peça 1: botão inválido.');
    expect(errors).toContain('Peça 1: não tem arte pronta.');
    expect(errors).toContain('Peça 1: escreva o texto principal.');
  });

  test('post impulsionado em Tráfego também precisa de link https', () => {
    const errors = validateDraft(base(), [ad({ mode: 'ig_post', link_url: null })], [post({ ig_media_id: 'ig-media-1' })], NOW);
    expect(errors).toContain('Peça 1: informe o link (https) para onde o anúncio leva.');
  });

  test('Advantage+ limita age_min a 25, preserva sugestão e ativa automação', () => {
    const c = base();
    c.draft.targeting.advantage_audience = true;
    c.draft.targeting.age_min = 30;
    c.draft.targeting.age_max = 50;
    const t = buildTargeting(c.draft);
    expect(t).toMatchObject({
      age_min: 25,
      age_range: [30, 50],
      targeting_automation: { advantage_audience: 1 },
    });
    expect(t).not.toHaveProperty('age_max');
  });

  test('sem Advantage+ envia idade mínima e máxima, automação explicitamente desligada', () => {
    expect(buildTargeting(base().draft)).toMatchObject({
      age_min: 25,
      age_max: 55,
      targeting_automation: { advantage_audience: 0 },
      geo_locations: { countries: ['BR'] },
    });
  });

  test('posicionamentos manuais: Facebook e Instagram, Stories no celular', () => {
    const c = base();
    c.draft.placements = { mode: 'manual', facebook: ['story'], instagram: ['stream'] };
    expect(buildTargeting(c.draft)).toMatchObject({
      publisher_platforms: ['facebook', 'instagram'],
      facebook_positions: ['story'],
      instagram_positions: ['stream'],
      device_platforms: ['mobile'],
    });
  });

  test('posicionamento automático não declara publisher_platforms', () => {
    expect(buildTargeting(base().draft)).not.toHaveProperty('publisher_platforms');
  });

  test('cidade sem raio usa 10 quilômetros', () => {
    const c = base();
    c.draft.targeting.cities = [{ key: '123', name: 'Goiânia' }];
    expect(buildTargeting(c.draft)).toMatchObject({
      geo_locations: { cities: [{ key: '123', radius: 10, distance_unit: 'kilometer' }] },
    });
  });

  test('público feminino e interesses geram genders e flexible_spec da Meta', () => {
    const c = base();
    c.draft.targeting.genders = 'female';
    c.draft.targeting.interests = [{ id: '6003', name: 'Liderança' }];
    expect(buildTargeting(c.draft)).toMatchObject({
      genders: [2],
      flexible_spec: [{ interests: [{ id: '6003', name: 'Liderança' }] }],
    });
  });

  test('regiões e raio explícito são traduzidos para geo_locations', () => {
    const c = base();
    c.draft.targeting.regions = [{ key: '1', name: 'Goiás' }];
    c.draft.targeting.cities = [{ key: '2', name: 'Goiânia', radius_km: 20 }];
    expect(buildTargeting(c.draft)).toMatchObject({
      geo_locations: {
        regions: [{ key: '1' }],
        cities: [{ key: '2', radius: 20, distance_unit: 'kilometer' }],
      },
    });
  });

  test('payload de campanha mantém verba no conjunto e status pausado', () => {
    expect(campaignPayload(base())).toEqual({
      name: 'Lançamento',
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      special_ad_categories: [],
      is_adset_budget_sharing_enabled: false,
    });
  });

  test('payload do conjunto de Tráfego: diária em centavos, site, meta e datas', () => {
    const result = adsetPayload(base(), IDS, 'c1');
    expect(result).toMatchObject({
      name: 'Lançamento · conjunto',
      campaign_id: 'c1',
      status: 'PAUSED',
      billing_event: 'IMPRESSIONS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      optimization_goal: 'LINK_CLICKS',
      daily_budget: 3050,
      destination_type: 'WEBSITE',
      start_time: '2026-11-16T12:00:00.000Z',
      end_time: '2026-11-21T12:00:00.000Z',
      targeting: { targeting_automation: { advantage_audience: 0 } },
    });
    expect(result).not.toHaveProperty('lifetime_budget');
  });

  test('conjunto de Reconhecimento: orçamento total, promoted_object e sem destino', () => {
    const c = base();
    c.objective = 'OUTCOME_AWARENESS';
    c.draft.budget_type = 'lifetime';
    const result = adsetPayload(c, IDS, 'c1');
    expect(result).toMatchObject({
      lifetime_budget: 3050,
      promoted_object: { page_id: 'pg1' },
      optimization_goal: 'REACH',
      status: 'PAUSED',
    });
    expect(result).not.toHaveProperty('daily_budget');
    expect(result).not.toHaveProperty('destination_type');
  });

  test('conjunto de Engajamento: destino na publicação', () => {
    const c = base();
    c.objective = 'OUTCOME_ENGAGEMENT';
    expect(adsetPayload(c, IDS, 'c1')).toMatchObject({
      destination_type: 'ON_POST',
      optimization_goal: 'POST_ENGAGEMENT',
    });
  });

  test('criativo do Instagram sem link não tem call_to_action', () => {
    const c = base();
    c.objective = 'OUTCOME_ENGAGEMENT';
    const result = creativePayload(c, ad({ mode: 'ig_post', link_url: null }), post({ ig_media_id: 'ig-media-1' }), IDS, 1);
    expect(result).toEqual({
      name: 'Lançamento · peça 1',
      object_id: 'pg1',
      instagram_user_id: 'ig1',
      source_instagram_media_id: 'ig-media-1',
    });
    expect(result).not.toHaveProperty('call_to_action');
  });

  test('criativo novo com um slide envia picture, CTA e link com UTMs', () => {
    const result = creativePayload(base(), ad(), post(), IDS, 1);
    expect(result).toMatchObject({
      name: 'Lançamento · peça 1',
      object_story_spec: {
        page_id: 'pg1',
        instagram_user_id: 'ig1',
        link_data: {
          picture: 'https://x/1.png',
          message: 'Texto',
          name: 'Título',
          call_to_action: { type: 'LEARN_MORE' },
        },
      },
    });
    const story = result.object_story_spec as { link_data: { link: string; call_to_action: { value: { link: string } } } };
    const url = new URL(story.link_data.link);
    expect(url.searchParams.get('utm_source')).toBe('hive');
    expect(url.searchParams.get('utm_medium')).toBe('paid');
    expect(url.searchParams.get('utm_campaign')).toBe(base().id);
    expect(story.link_data.call_to_action.value.link).toBe(story.link_data.link);
  });

  test('criativo com 12 slides gera somente 10 child_attachments com link e picture', () => {
    const rendered = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [
      'slide' + (i + 1), 'https://x/' + (i + 1) + '.png',
    ]));
    const result = creativePayload(base(), ad(), post({ rendered_slides: rendered }), IDS, 2);
    const story = result.object_story_spec as { link_data: { link: string; child_attachments: Array<{ link: string; picture: string; name: string }> } };
    const attachments = story.link_data.child_attachments;
    expect(attachments).toHaveLength(10);
    attachments.forEach((item, i) => {
      expect(item).toEqual({
        link: story.link_data.link,
        picture: 'https://x/' + (i + 1) + '.png',
        name: 'Título (' + (i + 1) + ')',
      });
    });
    expect(new URL(story.link_data.link).searchParams.get('utm_campaign')).toBe(base().id);
  });

  test('UTM mantém utm_source já informado e acrescenta medium e campanha', () => {
    const result = new URL(withUtm('https://a.com/?utm_source=ig', 'c'));
    expect(result.searchParams.get('utm_source')).toBe('ig');
    expect(result.searchParams.get('utm_medium')).toBe('paid');
    expect(result.searchParams.get('utm_campaign')).toBe('c');
  });

  test('payload de anúncio referencia conjunto e criativo, sempre pausado', () => {
    expect(adPayload(base(), 3, 'set1', 'creative1')).toEqual({
      name: 'Lançamento · peça 3',
      adset_id: 'set1',
      creative: { creative_id: 'creative1' },
      status: 'PAUSED',
    });
  });
});
