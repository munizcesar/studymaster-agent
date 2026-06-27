import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. Replace :root variables ---
old_root = """    :root {
      --color-bg:             #F4F6FB;
      --color-surface:        #FFFFFF;
      --color-surface-2:      #F0F4FA;
      --color-surface-raised: #FFFFFF;
      --color-surface-offset: #E8EFFE;
      --color-divider:        #E2E6EE;
      --color-border:         #DDE2EC;
      --color-text:           #0B1124;
      --color-text-muted:     #5A6478;
      --color-text-faint:     #8892A8;
      --color-primary:        #0D47FF;
      --color-primary-mid:    #00CCFF;
      --color-primary-hover:  #0836C9;
      --color-accent:         #FF2D20;
      --color-success:        #16A34A;
      --color-error:          #FF2D20;
      --color-warning:        #F59E0B;
      --grad-ai: linear-gradient(135deg, #0D47FF 0%, #00CCFF 48%, #7C4DFF 100%);
      --grad-os: linear-gradient(135deg, #FF2D20 0%, #FF6A00 100%);
      --grad-brand: linear-gradient(135deg, #0D47FF 0%, #00B8FF 34%, #7C4DFF 54%, #FF2D20 78%, #FF6A00 100%);
      --grad-brand-h: linear-gradient(135deg, #0836C9 0%, #0095D6 34%, #6636E8 54%, #D91F15 78%, #E05500 100%);
      --shadow-sm: 0 1px 2px oklch(0.2 0.03 260 / 0.06);
      --shadow-md: 0 4px 12px oklch(0.2 0.03 260 / 0.08);
      --shadow-lg: 0 12px 32px oklch(0.2 0.03 260 / 0.12);"""

new_root = """    :root {
      /* ── Neutral Scale (warm undertone, hue 250) ── */
      --neutral-50:  oklch(0.99 0.004 250);
      --neutral-100: oklch(0.96 0.006 250);
      --neutral-150: oklch(0.93 0.006 250);
      --neutral-200: oklch(0.89 0.007 250);
      --neutral-300: oklch(0.84 0.007 250);
      --neutral-400: oklch(0.76 0.008 250);
      --neutral-500: oklch(0.66 0.009 250);
      --neutral-600: oklch(0.55 0.008 250);
      --neutral-700: oklch(0.45 0.007 250);
      --neutral-800: oklch(0.35 0.006 250);
      --neutral-900: oklch(0.22 0.005 250);
      --neutral-950: oklch(0.12 0.004 250);
      
      /* ── Primary Scale (deep blue, hue 260) ── */
      --primary-100: oklch(0.92 0.06 260);
      --primary-200: oklch(0.82 0.10 260);
      --primary-300: oklch(0.72 0.15 260);
      --primary-400: oklch(0.62 0.20 260);
      --primary-500: oklch(0.50 0.22 260);  /* #0D47FF equivalent */
      --primary-600: oklch(0.40 0.22 260);
      --primary-700: oklch(0.30 0.20 260);
      --primary-800: oklch(0.22 0.16 260);
      --primary-900: oklch(0.15 0.10 260);
      
      /* ── Accent / Ciano (interactive glow) ── */
      --accent-400: oklch(0.75 0.20 210);
      --accent-500: oklch(0.68 0.22 210);  /* #00CCFF equivalent */
      --accent-600: oklch(0.60 0.20 210);
      --accent-glow: oklch(0.70 0.25 210 / 0.28);

      /* ── Semantic Colors ── */
      --color-bg:             var(--neutral-50);
      --color-surface:        var(--neutral-100);
      --color-surface-2:      var(--neutral-150);
      --color-surface-raised: var(--neutral-50);
      --color-surface-offset: var(--neutral-200);
      --color-divider:        var(--neutral-200);
      --color-border:         var(--neutral-300);
      --color-text:           var(--neutral-900);
      --color-text-muted:     var(--neutral-600);
      --color-text-faint:     var(--neutral-400);
      --color-primary:        var(--primary-500);
      --color-primary-mid:    var(--accent-500);
      --color-primary-hover:  var(--primary-600);
      --color-accent:         var(--accent-500);
      --color-accent-hover:   var(--accent-600);
      --color-success:        #16A34A;
      --color-error:          #DC2626;
      --color-warning:        #F59E0B;

      /* ── Gradients (cohesive 3-tone) ── */
      --grad-ai: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-400) 50%, var(--accent-400) 100%);
      --grad-os: linear-gradient(135deg, #DC2626 0%, #F59E0B 100%);
      --grad-brand: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-500) 50%, var(--accent-400) 100%);
      --grad-brand-h: linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 50%, var(--accent-600) 100%);

      /* ── Shadows ── */
      --shadow-sm: 0 1px 2px oklch(0.2 0.03 260 / 0.06);
      --shadow-md: 0 4px 12px oklch(0.2 0.03 260 / 0.08);
      --shadow-lg: 0 12px 32px oklch(0.2 0.03 260 / 0.12);"""

content = content.replace(old_root, new_root, 1)

# --- 2. Replace [data-theme="dark"] variables ---
old_dark = """    [data-theme="dark"] {
      --color-bg:             #080D26;
      --color-surface:        #0E1540;
      --color-surface-2:      #0B1238;
      --color-surface-raised: #151E52;
      --color-surface-offset: #141D52;
      --color-divider:        #1F2A5A;
      --color-border:         #1F2A5A;
      --color-text:           #F0F4FF;
      --color-text-muted:     #A8B6D9;
      --color-text-faint:     #7688B5;
      --color-primary:        #0D47FF;
      --color-primary-mid:    #00CCFF;
      --color-primary-hover:  #2D63FF;
      --color-accent:         #FF2D20;
      --color-success:        #4ADE80;
      --color-error:          #FF2D20;
      --color-warning:        #FBBF24;
      --grad-ai: linear-gradient(135deg, #0D47FF 0%, #00CCFF 48%, #7C4DFF 100%);
      --grad-os: linear-gradient(135deg, #FF2D20 0%, #FF6A00 100%);
      --grad-brand: linear-gradient(135deg, #0D47FF 0%, #00B8FF 34%, #7C4DFF 54%, #FF2D20 78%, #FF6A00 100%);
      --grad-brand-h: linear-gradient(135deg, #2D63FF 0%, #22C7FF 34%, #8D66FF 54%, #FF473D 78%, #FF7C24 100%);
      --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.24);
      --shadow-md: 0 4px 12px oklch(0 0 0 / 0.34);
      --shadow-lg: 0 12px 32px oklch(0 0 0 / 0.44);
    }"""

new_dark = """    [data-theme="dark"] {
      /* ── Neutral Scale (cool undertone for dark mode, hue 250) ── */
      --neutral-50:  oklch(0.99 0.004 250);
      --neutral-100: oklch(0.96 0.006 250);
      --neutral-150: oklch(0.93 0.006 250);
      --neutral-200: oklch(0.89 0.007 250);
      --neutral-300: oklch(0.84 0.007 250);
      --neutral-400: oklch(0.76 0.008 250);
      --neutral-500: oklch(0.66 0.009 250);
      --neutral-600: oklch(0.55 0.008 250);
      --neutral-700: oklch(0.45 0.007 250);
      --neutral-800: oklch(0.35 0.006 250);
      --neutral-900: oklch(0.22 0.005 250);
      --neutral-950: oklch(0.12 0.004 250);
      
      /* ── Primary Scale ── */
      --primary-100: oklch(0.92 0.06 260);
      --primary-200: oklch(0.82 0.10 260);
      --primary-300: oklch(0.72 0.15 260);
      --primary-400: oklch(0.62 0.20 260);
      --primary-500: oklch(0.50 0.22 260);
      --primary-600: oklch(0.40 0.22 260);
      --primary-700: oklch(0.30 0.20 260);
      --primary-800: oklch(0.22 0.16 260);
      --primary-900: oklch(0.15 0.10 260);
      
      /* ── Accent / Ciano ── */
      --accent-400: oklch(0.75 0.20 210);
      --accent-500: oklch(0.68 0.22 210);
      --accent-600: oklch(0.60 0.20 210);
      --accent-glow: oklch(0.70 0.25 210 / 0.20);

      /* ── Semantic Colors ── */
      --color-bg:             #080D26;
      --color-surface:        #0E1540;
      --color-surface-2:      #0B1238;
      --color-surface-raised: #151E52;
      --color-surface-offset: #141D52;
      --color-divider:        #1F2A5A;
      --color-border:         #1F2A5A;
      --color-text:           #F0F4FF;
      --color-text-muted:     #A8B6D9;
      --color-text-faint:     #7688B5;
      --color-primary:        var(--primary-500);
      --color-primary-mid:    var(--accent-500);
      --color-primary-hover:  var(--primary-400);
      --color-accent:         var(--accent-500);
      --color-accent-hover:   var(--accent-400);
      --color-success:        #4ADE80;
      --color-error:          #EF4444;
      --color-warning:        #FBBF24;

      /* ── Gradients ── */
      --grad-ai: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-400) 50%, var(--accent-400) 100%);
      --grad-os: linear-gradient(135deg, #EF4444 0%, #FBBF24 100%);
      --grad-brand: linear-gradient(135deg, var(--primary-800) 0%, var(--primary-500) 50%, var(--accent-400) 100%);
      --grad-brand-h: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-600) 50%, var(--accent-500) 100%);

      /* ── Shadows ── */
      --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.24);
      --shadow-md: 0 4px 12px oklch(0 0 0 / 0.34);
      --shadow-lg: 0 12px 32px oklch(0 0 0 / 0.44);
    }"""

content = content.replace(old_dark, new_dark, 1)

# --- 3. Update references to old --color-accent (now --color-accent is accent cyan, not red) ---
# The old --color-accent was #FF2D20 (red), now it's accent-500 (cyan)
# We need to update any CSS that uses --color-accent where it means "red/destructive"
# Let me check what references exist...

# Count occurrences
import re
accent_refs = list(re.finditer(r'var\(--color-accent\)', content))
print(f"References to --color-accent: {len(accent_refs)}")
banca_badge_count = len(list(re.finditer(r'banca-badge', content)))
print(f"banca-badge classes: {banca_badge_count}")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("OK - Color system applied!")
