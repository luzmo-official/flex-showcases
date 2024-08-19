export type ThemeMode = 'dark' | 'light' | 'auto';

export type AuthType = 'api' | 'login' | '2FA';

export type FrontendLanguage =
  | 'web'
  | 'angular'
  | 'vue'
  | 'react'
  | 'reactnative';

export type BackendLanguage =
  | 'javascript'
  | 'java'
  | 'python'
  | 'shell'
  | 'php'
  | 'csharp';

export type HighlightLanguage =
  | 'javascript'
  | 'java'
  | 'python'
  | 'bash'
  | 'php'
  | 'csharp'
  | 'html'
  | 'json';

export type BackendLanguageChoice = {
  key: BackendLanguage;
  name: string;
  logo: string;
  defaultHighlightLanguage: HighlightLanguage;
};

export type FrontendLanguageChoice = {
  key: FrontendLanguage;
  name: string;
  logo: string;
  defaultHighlightLanguage: HighlightLanguage;
};

export type LanguageType = 'backend' | 'frontend';

export type Preference = {
  frontend: FrontendLanguage;
  backend: BackendLanguage;
};
