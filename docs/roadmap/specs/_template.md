# Spec <Sprint N> — <nome da funcionalidade>

Status: rascunho | aprovada por <nome> em <data>
Branch: `sprint-N/<nome>`

## 1. Objetivo

Uma frase: o que a criança ou o adulto passa a conseguir fazer.

## 2. Pilares afetados

Marcar (`docs/gdd/pilares-e-regras.md`): [ ] estratégia antes de memória · [ ] zero punição/zero cronômetro · [ ] leitura como alavanca · [ ] alicerce antes de ×/÷ · [ ] adulto no controle.
Se algum for tensionado, explicar e pedir decisão.

## 3. Regras do GDD relevantes

Links para os trechos (arquivo + seção). Listar decisões `D<n>` envolvidas e se estão `[APROVADO]`. **Não implementar nada com decisão `[PROPOSTA]` aberta.**

## 4. Critérios de aceite (Dado / Quando / Então)

- **Dado** … **quando** … **então** …
  Cada critério vira pelo menos um teste.

## 5. Casos de borda

Lista (estado vazio, offline, sem voz pt-BR, relógio com fuso, erro dobrado, apoio aberto, troca de aparelho).

## 6. Fora de escopo

O que NÃO entra neste sprint.

## 7. Parâmetros

Valores usados e onde moram em `src/domain/config/params.ts`. **Mudança de valor = decisão humana.**

## 8. Testes exigidos

- Domínio (Vitest, **escritos antes do código**, com `Clock` e `Rng` injetados).
- Tela nova: Playwright em 360×740.
- Conteúdo novo: passa em `npm run validate:content`.
- Acessibilidade: alvos ≥ 56 px, foco, rótulos (`docs/ux/acessibilidade.md`).

## 9. Impacto em dados e LGPD

Que dado da criança entra ou sai (só apelido, ano escolar, respostas). Retenção. Direito de apagar. Nada de analytics/trackers/CDN externos.

## 10. Checklist de segurança infantil

- [ ] Sem anúncio, compra, chat, ranking, link externo na área da criança
- [ ] Sem texto livre da criança
- [ ] Sem som ou texto de fracasso; sem cronômetro visível
- [ ] Tempo de resposta nunca mostrado à criança
- [ ] Textos revisados (amostragem humana; dicas 100%)

## 11. Definition of Done

`npm run verify` e `npm run e2e` verdes · bundle JS < 300 KB gzip · teste para toda mudança em `src/domain` · conteúdo novo valida · PR com checklist acima.
