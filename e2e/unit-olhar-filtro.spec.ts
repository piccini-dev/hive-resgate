import { test, expect } from '@playwright/test';
import { nomesEncontrados, textosVisiveis } from '../supabase/functions/_shared/olhar-filtro';

// Olhar Bee — revisão de nomes (proposta, camada 3): o que barra e o que não pode barrar.
const NOMES = [
  { termo: 'Mar', exato: true },
  { termo: 'Apo', exato: true },
  { termo: 'Galderma', exato: true },
  { termo: 'Ângela', exato: true },
  { termo: 'Asseca Margo', exato: false },
  { termo: 'Philip Morris', exato: false },
];

test('palavra inteira e com maiúscula: "Mar" barra, "mar" e "Março" não (olhar · camada 3)', () => {
  expect(nomesEncontrados('Conversei com Mar ontem.', NOMES)).toEqual(['Mar']);
  expect(nomesEncontrados('Um mar de urgências em Março.', NOMES)).toEqual([]);
  expect(nomesEncontrados('Faltou apoio e Apoio da liderança.', NOMES)).toEqual([]);
});

test('acentos e pontuação ao redor não escondem o nome', () => {
  expect(nomesEncontrados('Na Galderma, (Ângela) decidia tudo.', NOMES).sort()).toEqual(['Galderma', 'Ângela']);
});

test('expressão de várias palavras: sem diferenciar maiúsculas nem acentos', () => {
  expect(nomesEncontrados('como na asseca margo e na PHILIP MORRIS', NOMES).sort()).toEqual(['Asseca Margo', 'Philip Morris']);
  expect(nomesEncontrados('Filipe morreu de rir', NOMES)).toEqual([]);
});

test('confere todo texto visível da resposta, menos href/área/id', () => {
  const resp = {
    type: 'reading',
    reading: { parece: { text: 'Algo com Mar.' }, invisivel: { text: 'x' }, movimento: { text: 'y' }, semelhantes: [{ area: 'Cultura', title: 'z', text: '', href: 'https://Mar' }], area_provavel: 'cultura' },
  };
  const t = textosVisiveis(resp);
  expect(t).toContain('Algo com Mar.');
  expect(t).not.toContain('https://');
  expect(nomesEncontrados(textosVisiveis({ type: 'care', message: 'Tudo bem.' }), NOMES)).toEqual([]);
});
