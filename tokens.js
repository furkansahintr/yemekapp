/**
 * ═══════════════════════════════════════
 *  DESIGN TOKENS — Food Delivery App
 * ═══════════════════════════════════════
 *  Tüm tasarım değişkenleri burada.
 *  Değiştirdiğin değer otomatik olarak
 *  tüm uygulamaya yansır.
 * ═══════════════════════════════════════
 */

const TOKENS = {

  /* ── Colors ── */
  colors: {
    primary:      '#F65013',
    primaryDeep:  '#D44410',
    primaryLight: '#FEF0E8',
    primarySoft:  'rgba(246,80,19,0.08)',
    secondary:    '#6B7280',
    tertiary:     '#F3F4F6',
    accent:       '#D4A056',

    light: {
      bgPage:           '#FFFFFF',
      bgPhone:          '#FFFFFF',
      bgSurface:        '#FFFFFF',
      bgSurfaceAlt:     '#FAFAFA',
      glassBg:          'rgba(255,255,255,0.80)',
      glassCard:        '#F4F4F5',
      glassCardStrong:  '#EFEFEF',
      glassCardTinted:  'rgba(246,80,19,0.06)',
      textPrimary:      '#18181B',
      textSecondary:    '#52525B',
      textTertiary:     '#A1A1AA',
      textInverse:      '#FFFFFF',
      textMuted:        'rgba(24,24,27,0.45)',
      bgBtn:            'rgb(243,244,246)',
      borderSubtle:     'rgba(3,7,18,0.1)',
      shadowSm:         '0 3px 8px rgba(3,7,18,0.1)',
      shadowMd:         '0 6px 16px rgba(3,7,18,0.1)',
      shadowLg:         '0 9px 24px rgba(3,7,18,0.1)',
    },

    dark: {
      bgPage:           '#030712',
      bgPhone:          '#030712',
      bgSurface:        '#0A0F1A',
      bgSurfaceAlt:     '#111827',
      glassBg:          'rgba(3,7,18,0.80)',
      glassCard:        'rgba(255,255,255,0.06)',
      glassCardStrong:  'rgba(255,255,255,0.09)',
      glassCardTinted:  'rgba(246,80,19,0.08)',
      textPrimary:      '#FAFAFA',
      textSecondary:    '#A1A1AA',
      textTertiary:     '#52525B',
      textInverse:      '#030712',
      textMuted:        'rgba(250,250,250,0.4)',
      bgBtn:            'rgb(17,24,39)',
      borderSubtle:     'rgba(229,231,235,0.1)',
      shadowSm:         '0 3px 8px rgba(156,163,175,0.1)',
      shadowMd:         '0 6px 16px rgba(156,163,175,0.1)',
      shadowLg:         '0 9px 24px rgba(156,163,175,0.1)',
      primaryDeep:      '#F88A60',
      primaryLight:     '#1C0D06',
      secondary:        '#9CA3AF',
      tertiary:         '#111827',
    }
  },

  /* ── Effects ── */
  effects: {
    glassBlur: 'blur(32px)',
  },

  /* ── Spacing ── */
  spacing: {
    appPx: '16px',
  },

  /* ── Button ── */
  button: {
    py:    '16px',
    px:    '16px',
    icon:  '16px',
    font:  'md',
    gap:   '10px',
  },

  /* ── Radius ── */
  radius: {
    sm:   '8px',
    md:   '12px',
    lg:   '16px',
    xl:   '20px',
    xxl:  '28px',
    full: '999px',
  },

  /* ── Typography ── */
  typography: {
    family: "'Inter var',ui-sans-serif,system-ui,sans-serif",
    sizes: {
      xs:   '11px',
      sm:   '12px',
      md:   '14px',
      lg:   '16px',
      xl:   '20px',
      xxl:  '24px',
      xxxl: '28px',
    },
    weights: {
      regular:  400,
      medium:   500,
      semibold: 600,
      bold:     700,
    },
  },
};


/* ── Token Injection ── */
function injectTokens() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  const t = isDark ? TOKENS.colors.dark : TOKENS.colors.light;

  // Backgrounds
  root.style.setProperty('--bg-page', t.bgPage);
  root.style.setProperty('--bg-phone', t.bgPhone);
  root.style.setProperty('--bg-surface', t.bgSurface);
  root.style.setProperty('--bg-surface-alt', t.bgSurfaceAlt);

  // Glass
  root.style.setProperty('--glass-bg', t.glassBg);
  root.style.setProperty('--glass-card', t.glassCard);
  root.style.setProperty('--glass-card-strong', t.glassCardStrong);
  root.style.setProperty('--glass-card-tinted', t.glassCardTinted);
  root.style.setProperty('--glass-blur', TOKENS.effects.glassBlur);

  // Text
  root.style.setProperty('--text-primary', t.textPrimary);
  root.style.setProperty('--text-secondary', t.textSecondary);
  root.style.setProperty('--text-tertiary', t.textTertiary);
  root.style.setProperty('--text-inverse', t.textInverse);
  root.style.setProperty('--text-muted', t.textMuted);

  // Borders & Shadows
  root.style.setProperty('--bg-btn', t.bgBtn);
  root.style.setProperty('--border-subtle', t.borderSubtle);
  root.style.setProperty('--shadow-sm', t.shadowSm);
  root.style.setProperty('--shadow-md', t.shadowMd);
  root.style.setProperty('--shadow-lg', t.shadowLg);

  // Brand colors
  root.style.setProperty('--primary', TOKENS.colors.primary);
  root.style.setProperty('--primary-deep', isDark ? t.primaryDeep : TOKENS.colors.primaryDeep);
  root.style.setProperty('--primary-light', isDark ? t.primaryLight : TOKENS.colors.primaryLight);
  root.style.setProperty('--primary-soft', TOKENS.colors.primarySoft);
  root.style.setProperty('--secondary', isDark ? t.secondary || TOKENS.colors.secondary : TOKENS.colors.secondary);
  root.style.setProperty('--tertiary', isDark ? t.tertiary || TOKENS.colors.tertiary : TOKENS.colors.tertiary);

  // Spacing
  root.style.setProperty('--app-px', TOKENS.spacing.appPx);

  // Button
  const btn = TOKENS.button;
  root.style.setProperty('--btn-py', btn.py);
  root.style.setProperty('--btn-px', btn.px);
  root.style.setProperty('--btn-icon', btn.icon);
  root.style.setProperty('--btn-font', `var(--fs-${btn.font})`);
  root.style.setProperty('--btn-gap', btn.gap);

  // Radius
  root.style.setProperty('--r-sm', TOKENS.radius.sm);
  root.style.setProperty('--r-md', TOKENS.radius.md);
  root.style.setProperty('--r-lg', TOKENS.radius.lg);
  root.style.setProperty('--r-xl', TOKENS.radius.xl);
  root.style.setProperty('--r-2xl', TOKENS.radius.xxl);
  root.style.setProperty('--r-full', TOKENS.radius.full);

  // Typography
  root.style.setProperty('--font', TOKENS.typography.family);
  Object.entries(TOKENS.typography.sizes).forEach(([k, v]) => {
    const map = { xs:'xs', sm:'sm', md:'md', lg:'lg', xl:'xl', xxl:'2xl', xxxl:'3xl' };
    root.style.setProperty('--fs-' + (map[k] || k), v);
  });
  root.style.setProperty('--fw-regular', TOKENS.typography.weights.regular);
  root.style.setProperty('--fw-medium', TOKENS.typography.weights.medium);
  root.style.setProperty('--fw-semibold', TOKENS.typography.weights.semibold);
  root.style.setProperty('--fw-bold', TOKENS.typography.weights.bold);
}
