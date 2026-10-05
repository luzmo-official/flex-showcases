// ============================================================================
// Progress tree (shared by /AIPrompt progress events and TeamsUpdater)
// ============================================================================

export type ProgressStatus = 'pending' | 'inProgress' | 'success' | 'error';

export interface ProgressTreeNode {
  id: string;
  step: string;
  status: ProgressStatus;
  children?: ProgressTreeNode[];
  description?: string;
  descriptionMetadata?: Record<string, unknown>;
}

// ============================================================================
// /AIPrompt stream messages (normalized for message-handler)
// ============================================================================

export interface AIPromptStartMessage {
  start: true;
  conversationId: string;
}

export interface AIPromptProgressMessage {
  progress: ProgressTreeNode;
  conversationId?: string;
}

export interface AIPromptTextDeltaMessage {
  textDelta: string;
}

export interface AIPromptFinishMessage {
  finish: true;
  conversationId?: string;
  result: AIPromptResult | null;
}

export interface AIPromptErrorMessage {
  error: string;
}

export type AIPromptStreamMessage =
  | AIPromptStartMessage
  | AIPromptProgressMessage
  | AIPromptTextDeltaMessage
  | AIPromptFinishMessage
  | AIPromptErrorMessage;

// ============================================================================
// /AIPrompt API shapes (createAIPrompt.md)
// ============================================================================

export interface AIMessageAsset {
  id?: string;
  message_id?: string;
  type: 'item' | string;
  value?: ItemConfig;
}

export interface AIMessage {
  id?: string;
  conversation_id?: string;
  message?: string;
  role?: string;
  agent?: string;
  task?: string;
  aiMessageAssets?: AIMessageAsset[];
}

export interface AIPromptResult {
  conversation_id?: string;
  user_message?: AIMessage;
  assistant_message?: AIMessage;
}

export interface AIPromptRequestParams {
  question: string;
  luzmoKey: string;
  luzmoToken: string;
  luzmoHost: string;
  datasetIds: string[];
  conversationId?: string;
  localeId?: string;
  timezoneId?: string;
}

// ============================================================================
// Chart / Item Configuration
// ============================================================================

export interface ItemConfig {
  type: string;
  slots: unknown[];
  filters?: unknown[];
  options: Record<string, unknown>;
  title?: Record<string, string>;
}

// ============================================================================
// User & Permissions
// ============================================================================

export interface UserCredentials {
  email: string;
  luzmoKey: string;
  luzmoToken: string;
}

export interface UserConfigEntry {
  luzmoKey: string;
  luzmoToken: string;
}

/** email -> credentials */
export type UsersConfig = Record<string, UserConfigEntry>;

export type MicrosoftAppType = 'SingleTenant' | 'MultiTenant';

// ============================================================================
// App Configuration
// ============================================================================

export interface AppConfig {
  microsoftAppId: string;
  microsoftAppPassword: string;
  microsoftAppType: MicrosoftAppType;
  microsoftAppTenantId?: string;
  port: number;
  /** Public HTTPS origin, no trailing slash. Used to serve chart PNGs. */
  publicBaseUrl?: string;
  datasetIds: string[];
  luzmoHost: string;
  users: UsersConfig;
  /** When true (default), mint scoped embed tokens for /AIPrompt calls. */
  useEmbedAuth: boolean;
}
