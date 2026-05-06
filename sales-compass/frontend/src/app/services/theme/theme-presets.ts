import type { ThemePreset } from './theme.service';

/**
 * Pre-defined theme presets for the application.
 * Each preset defines a complete color scheme.
 */
export const THEME_PRESETS: ThemePreset[] = [
  // 1. Ocean Blue (light)
  {
    id: 'ocean-blue',
    translationKey: 'theme.preset-ocean-blue',
    colors: {
      primary: 'rgb(30, 64, 175)',
      primaryDarker: 'rgb(23, 49, 134)',
      primaryLighter: 'rgb(59, 93, 199)',
      primaryInverse: 'rgb(255, 255, 255)',
      secondary: 'rgb(217, 119, 6)',
      secondaryLighter: 'rgb(245, 158, 11)',
      secondaryDarker: 'rgb(180, 98, 5)',
      secondaryInverse: 'rgb(255, 255, 255)',
      surface: 'rgb(248, 250, 252)',
      surfaceRaised: 'rgb(241, 245, 249)',
      textDimmed: 'rgb(100, 116, 139)',
      text: 'rgb(51, 65, 85)',
      textActive: 'rgb(15, 23, 42)',
      borderLight: 'rgba(15, 23, 42, 0.08)',
      border: 'rgba(15, 23, 42, 0.12)',
      borderHard: 'rgba(15, 23, 42, 0.25)'
    }
  },
  // 2. Midnight (dark)
  {
    id: 'midnight',
    translationKey: 'theme.preset-midnight',
    colors: {
      primary: 'rgb(6, 182, 212)',
      primaryDarker: 'rgb(5, 145, 169)',
      primaryLighter: 'rgb(34, 211, 238)',
      primaryInverse: 'rgb(15, 23, 42)',
      secondary: 'rgb(192, 38, 211)',
      secondaryLighter: 'rgb(217, 70, 239)',
      secondaryDarker: 'rgb(147, 29, 161)',
      secondaryInverse: 'rgb(255, 255, 255)',
      surface: 'rgb(15, 23, 42)',
      surfaceRaised: 'rgb(30, 41, 59)',
      textDimmed: 'rgb(148, 163, 184)',
      text: 'rgb(203, 213, 225)',
      textActive: 'rgb(248, 250, 252)',
      borderLight: 'rgba(248, 250, 252, 0.08)',
      border: 'rgba(248, 250, 252, 0.12)',
      borderHard: 'rgba(248, 250, 252, 0.25)'
    }
  },
  // 3. Forest (light)
  {
    id: 'forest',
    translationKey: 'theme.preset-forest',
    colors: {
      primary: 'rgb(21, 128, 61)',
      primaryDarker: 'rgb(17, 102, 49)',
      primaryLighter: 'rgb(34, 166, 79)',
      primaryInverse: 'rgb(255, 255, 255)',
      secondary: 'rgb(202, 138, 4)',
      secondaryLighter: 'rgb(234, 179, 8)',
      secondaryDarker: 'rgb(161, 110, 3)',
      secondaryInverse: 'rgb(38, 36, 34)',
      surface: 'rgb(254, 252, 247)',
      surfaceRaised: 'rgb(245, 243, 235)',
      textDimmed: 'rgb(120, 113, 108)',
      text: 'rgb(68, 64, 60)',
      textActive: 'rgb(28, 25, 23)',
      borderLight: 'rgba(28, 25, 23, 0.08)',
      border: 'rgba(28, 25, 23, 0.12)',
      borderHard: 'rgba(28, 25, 23, 0.25)'
    }
  },
  // 4. Aurora (dark)
  {
    id: 'aurora',
    translationKey: 'theme.preset-aurora',
    colors: {
      primary: 'rgb(52, 211, 153)',
      primaryDarker: 'rgb(42, 168, 122)',
      primaryLighter: 'rgb(110, 231, 183)',
      primaryInverse: 'rgb(17, 24, 39)',
      secondary: 'rgb(139, 92, 246)',
      secondaryLighter: 'rgb(167, 139, 250)',
      secondaryDarker: 'rgb(109, 72, 196)',
      secondaryInverse: 'rgb(255, 255, 255)',
      surface: 'rgb(17, 24, 39)',
      surfaceRaised: 'rgb(31, 41, 55)',
      textDimmed: 'rgb(156, 163, 175)',
      text: 'rgb(209, 213, 219)',
      textActive: 'rgb(249, 250, 251)',
      borderLight: 'rgba(249, 250, 251, 0.08)',
      border: 'rgba(249, 250, 251, 0.12)',
      borderHard: 'rgba(249, 250, 251, 0.25)'
    }
  },
  // 5. Sunset (light)
  {
    id: 'sunset',
    translationKey: 'theme.preset-sunset',
    colors: {
      primary: 'rgb(234, 88, 12)',
      primaryDarker: 'rgb(194, 73, 10)',
      primaryLighter: 'rgb(249, 115, 22)',
      primaryInverse: 'rgb(255, 255, 255)',
      secondary: 'rgb(157, 23, 77)',
      secondaryLighter: 'rgb(190, 35, 96)',
      secondaryDarker: 'rgb(125, 18, 61)',
      secondaryInverse: 'rgb(255, 255, 255)',
      surface: 'rgb(255, 251, 245)',
      surfaceRaised: 'rgb(254, 243, 232)',
      textDimmed: 'rgb(133, 119, 109)',
      text: 'rgb(87, 76, 68)',
      textActive: 'rgb(41, 35, 30)',
      borderLight: 'rgba(41, 35, 30, 0.08)',
      border: 'rgba(41, 35, 30, 0.12)',
      borderHard: 'rgba(41, 35, 30, 0.25)'
    }
  },
  // 6. Amber Noir (dark)
  {
    id: 'amber-noir',
    translationKey: 'theme.preset-amber-noir',
    colors: {
      primary: 'rgb(245, 158, 11)',
      primaryDarker: 'rgb(217, 119, 6)',
      primaryLighter: 'rgb(251, 191, 36)',
      primaryInverse: 'rgb(23, 23, 23)',
      secondary: 'rgb(180, 83, 9)',
      secondaryLighter: 'rgb(217, 119, 6)',
      secondaryDarker: 'rgb(146, 64, 14)',
      secondaryInverse: 'rgb(255, 255, 255)',
      surface: 'rgb(23, 23, 23)',
      surfaceRaised: 'rgb(38, 38, 38)',
      textDimmed: 'rgb(163, 163, 163)',
      text: 'rgb(212, 212, 212)',
      textActive: 'rgb(250, 250, 250)',
      borderLight: 'rgba(250, 250, 250, 0.08)',
      border: 'rgba(250, 250, 250, 0.12)',
      borderHard: 'rgba(250, 250, 250, 0.25)'
    }
  },
  // 7. Rose Quartz (light)
  {
    id: 'rose-quartz',
    translationKey: 'theme.preset-rose-quartz',
    colors: {
      primary: 'rgb(219, 39, 119)',
      primaryDarker: 'rgb(176, 31, 95)',
      primaryLighter: 'rgb(236, 72, 153)',
      primaryInverse: 'rgb(255, 255, 255)',
      secondary: 'rgb(124, 58, 237)',
      secondaryLighter: 'rgb(147, 93, 244)',
      secondaryDarker: 'rgb(99, 46, 189)',
      secondaryInverse: 'rgb(255, 255, 255)',
      surface: 'rgb(253, 242, 248)',
      surfaceRaised: 'rgb(252, 231, 243)',
      textDimmed: 'rgb(136, 116, 128)',
      text: 'rgb(88, 72, 82)',
      textActive: 'rgb(44, 36, 41)',
      borderLight: 'rgba(44, 36, 41, 0.08)',
      border: 'rgba(44, 36, 41, 0.12)',
      borderHard: 'rgba(44, 36, 41, 0.25)'
    }
  },
  // 8. Volcanic (dark)
  {
    id: 'volcanic',
    translationKey: 'theme.preset-volcanic',
    colors: {
      primary: 'rgb(239, 68, 68)',
      primaryDarker: 'rgb(185, 53, 53)',
      primaryLighter: 'rgb(248, 113, 113)',
      primaryInverse: 'rgb(255, 255, 255)',
      secondary: 'rgb(249, 115, 22)',
      secondaryLighter: 'rgb(251, 146, 60)',
      secondaryDarker: 'rgb(234, 88, 12)',
      secondaryInverse: 'rgb(28, 25, 23)',
      surface: 'rgb(28, 25, 23)',
      surfaceRaised: 'rgb(41, 37, 36)',
      textDimmed: 'rgb(168, 162, 158)',
      text: 'rgb(214, 211, 209)',
      textActive: 'rgb(250, 250, 249)',
      borderLight: 'rgba(250, 250, 249, 0.08)',
      border: 'rgba(250, 250, 249, 0.12)',
      borderHard: 'rgba(250, 250, 249, 0.25)'
    }
  },
  // 9. Slate (light)
  {
    id: 'slate',
    translationKey: 'theme.preset-slate',
    colors: {
      primary: 'rgb(71, 85, 105)',
      primaryDarker: 'rgb(51, 65, 85)',
      primaryLighter: 'rgb(100, 116, 139)',
      primaryInverse: 'rgb(255, 255, 255)',
      secondary: 'rgb(120, 113, 108)',
      secondaryLighter: 'rgb(146, 141, 137)',
      secondaryDarker: 'rgb(87, 83, 78)',
      secondaryInverse: 'rgb(255, 255, 255)',
      surface: 'rgb(255, 255, 255)',
      surfaceRaised: 'rgb(248, 250, 252)',
      textDimmed: 'rgb(148, 163, 184)',
      text: 'rgb(71, 85, 105)',
      textActive: 'rgb(15, 23, 42)',
      borderLight: 'rgba(15, 23, 42, 0.06)',
      border: 'rgba(15, 23, 42, 0.1)',
      borderHard: 'rgba(15, 23, 42, 0.2)'
    }
  }
];
