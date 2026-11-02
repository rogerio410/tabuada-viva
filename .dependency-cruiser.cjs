/** Regras de camada (ver CLAUDE.md). Violação quebra o CI. */
module.exports = {
  forbidden: [
    {
      name: 'domain-puro',
      comment:
        'src/domain é TS puro: não importa nada de fora dele (nem react, dexie, supabase, zod).',
      severity: 'error',
      from: { path: '^src/domain', pathNot: '\\.test\\.ts$' },
      to: { pathNot: '^src/domain', dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'content-nao-importa-ui-data',
      severity: 'error',
      from: { path: '^src/content' },
      to: { path: '^src/(ui|data|dashboard)' },
    },
    {
      name: 'ui-sem-data-concreto',
      comment: 'UI usa repositórios via interfaces/injeção, nunca Dexie/Supabase direto.',
      severity: 'error',
      from: { path: '^src/(ui|dashboard)' },
      to: { path: ['^src/data/(local|remote)', '^node_modules/(dexie|@supabase)'] },
    },
    {
      name: 'data-sem-ui',
      severity: 'error',
      from: { path: '^src/data' },
      to: { path: '^src/(ui|dashboard)' },
    },
    {
      name: 'ui-e-dashboard-isolados',
      severity: 'error',
      from: { path: '^src/ui' },
      to: { path: '^src/dashboard' },
    },
    {
      name: 'sem-trackers',
      comment: 'Sem analytics/ads/rastreadores (LGPD art. 14).',
      severity: 'error',
      from: {},
      to: {
        path: '^node_modules/(@?sentry|google-analytics|react-ga|mixpanel|amplitude|posthog|@segment|hotjar|facebook|firebase/analytics)',
      },
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.app.json' },
    parser: 'swc',
    doNotFollow: { path: 'node_modules' },
  },
}
