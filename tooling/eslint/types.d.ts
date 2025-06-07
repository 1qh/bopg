declare module 'eslint-plugin-import' {
  export const configs: {
    recommended: { rules: Linter.RulesRecord }
  }
  export const rules: Record<string, Rule.RuleModule>
}

declare module '@next/eslint-plugin-next' {
  export const configs: {
    'core-web-vitals': { rules: Linter.RulesRecord }
    recommended: { rules: Linter.RulesRecord }
  }
  export const rules: Record<string, Rule.RuleModule>
}

declare module 'eslint-plugin-better-tailwindcss' {
  export const configs: {
    'recommended-error': { rules: Linter.RulesRecord }
  }
  export const rules: Record<string, Rule.RuleModule>
}
