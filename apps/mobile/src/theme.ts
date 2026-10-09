// TAKATAK brand colours (docs/BRAND.md). Green, red and amber are for status only.

export const colors = {
  navy: "#060D1F",
  midnight: "#0B1B3D",
  midnightRaised: "#12264F",
  electric: "#1F8BFF",
  brandBlue: "#1565D8",
  cyan: "#29C3FF",
  white: "#F5F8FC",
  silver: "#B8C4D3",
  border: "#22365F",
  // Status only.
  success: "#2FBF71",
  danger: "#E5484D",
  warning: "#F5A524",
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

/** Minimum tap target (WCAG 2.5.5 / platform guidance). */
export const TAP = 48;

export const type = {
  title: { fontSize: 28, fontWeight: "800" as const, color: colors.white },
  heading: { fontSize: 20, fontWeight: "700" as const, color: colors.white },
  body: { fontSize: 16, color: colors.white },
  secondary: { fontSize: 15, color: colors.silver },
  label: { fontSize: 12, letterSpacing: 2, fontWeight: "700" as const, color: colors.silver },
};
