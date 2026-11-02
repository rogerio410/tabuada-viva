# Audio brief

Status: `[PROPOSTA]`. Da fonte: "acerto com som e animação curta (menos de 1 s); erro com uma dica visual, **sem som de fracasso**" (L311) e narração opcional por Web Speech API em pt-BR (L310). Todo o resto é proposta. Decisão do responsável: sons **sintetizados por Web Audio**, sem arquivos. Decisão ligada: D18. **Aprovado pelo responsável em 2026-11-02** (os rótulos `[PROPOSTA]` restantes neste arquivo são detalhes aprovados junto com o documento).

## Regras

1. **Nenhum som de fracasso.** Erro = silêncio, ou um "toc" curto, neutro e suave; nunca descendente, grave, buzina ou risada.
2. Sons só de acerto, progresso, conclusão e interface; duração máxima **< 1 s** (L311).
3. Nenhum som ao abrir o app, no painel do adulto ou durante a leitura de uma história.
4. Modo mudo global e por categoria; respeitar o mudo do aparelho; padrão: **ligado, volume moderado**, mudo disponível em um toque.
5. Sem trilha longa nem música em loop obrigatória. Ambiente de mundo é opcional e **desligado por padrão**.
6. Todo som tem equivalente visual (ver `acessibilidade.md`).
7. Nada grava a voz da criança.

## Síntese (Web Audio)

- Módulo isolado em `src/ui/audio`; **não** toca em `src/domain`. Sem dependência nova.
- `AudioContext` criado/retomado só após o primeiro toque do usuário (política do iOS e do Chrome).
- Cada som é uma receita de poucos osciladores com envelope curto: `forma` (seno ou triângulo, nunca serra ou quadrada), `freq` (Hz), `dur` (ms), `ataque` (ms), `decaimento` (ms).
- Ganho máximo ≈ 0,25 (cerca de −12 dBFS) e um `DynamicsCompressor` leve para evitar picos; nenhum som perto do máximo.
- Faixa de frequências 300–1200 Hz (agradável para crianças, sem sons estridentes).
- Todos os sons juntos pesam poucos KB de código. Arquivos de áudio: **0 KB**.

## Catálogo `[PROPOSTA]`

| ID                     | Quando                    | Receita (rascunho)                                          | Duração                         |
| ---------------------- | ------------------------- | ----------------------------------------------------------- | ------------------------------- |
| `SFX-HIT`              | acerto                    | duas notas ascendentes: 523 → 659 Hz, seno                  | 320 ms                          |
| `SFX-HIT-AIDED`        | acerto com apoio          | uma nota suave: 523 Hz, triângulo                           | 180 ms                          |
| `SFX-STREAK`           | 3 acertos seguidos        | três notas ascendentes: 523, 659, 784 Hz                    | 450 ms                          |
| `SFX-HINT`             | dica aparece              | uma nota neutra: 440 Hz, seno, ataque lento                 | 200 ms                          |
| `SFX-TAP`              | toque de tecla (opcional) | clique curto: 600 Hz                                        | 40 ms                           |
| `SFX-STAR-1/2/3`       | estrelas ao fim da fase   | 1, 2 ou 3 notas ascendentes                                 | 400–800 ms                      |
| `SFX-PHASE-END`        | fase concluída            | arpejo ascendente 523, 659, 784, 1047 Hz                    | 800 ms                          |
| `SFX-CAJU`             | cajus ganhos              | duas notas agudas curtas: 784, 988 Hz                       | 250 ms                          |
| `SFX-BUY`              | compra confirmada         | três notas ascendentes suaves                               | 500 ms                          |
| `SFX-TOOL`             | abrir ou fechar um apoio  | "pop" curto: 500 Hz                                         | 60 ms                           |
| `SFX-REST`             | convite ao descanso       | duas notas descendentes **suaves e calmas** (nunca no erro) | 700 ms                          |
| `AMB-W1…W9` (opcional) | ambiente de mundo         | camada de ruído filtrado muito suave + 1 nota ocasional     | loop de 8–12 s, ≤ 0,05 de ganho |

Observação: `SFX-REST` usa notas descendentes só como sinal de calma ao fim da sessão, nunca após uma resposta. Se isso parecer parente de "fracasso" na revisão humana, trocar por duas notas ascendentes calmas.

## Narração (Web Speech API)

- Melhoria progressiva `[FONTE L310]`: o botão de alto-falante só aparece quando existe voz pt-BR.
- Taxa ≈ 0,9 e tom neutro a levemente agudo `[PROPOSTA]`; pausa entre as frases da história (usar pontuação).
- Pronúncia de contas: "7 × 8" → "7 vezes 8"; "12 ÷ 3" → "12 dividido por 3"; "5 − 2" → "5 menos 2"; "R$ 5" → "5 reais". O texto escrito continua com os símbolos.
- Fallback sem voz pt-BR: esconder o botão; avisar só o adulto, no painel. iOS e Android divergem (R4 do plano); testar em aparelho real.
- A narração não substitui a leitura; o texto fica sempre visível.

## Segurança auditiva

Volume máximo moderado, sem picos, sem sons repentinos de alta frequência; a criança e o adulto podem silenciar; lembrete ao adulto, no painel, de manter o volume do aparelho baixo.

## Testes

Unidade: cada receita respeita `dur < 1000 ms` e `ganho ≤ 0,25`; não há receita com frequência descendente ligada a erro (teste por ID). Playwright: o mudo desliga todos os sons. Manual: iOS (ativação após toque) e Android intermediário.
