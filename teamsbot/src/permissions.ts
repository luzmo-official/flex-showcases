import type { TurnContext } from 'botbuilder';
import { TeamsInfo } from 'botbuilder';
import type { AppConfig, UserCredentials } from './types.js';
import { credentialsForEmail } from './users.js';

/**
 * Caches Teams user ID -> email to avoid repeated Graph calls.
 * Emails don't change for a user, so successful lookups stay cached.
 */
const emailCache = new Map<string, string>();

interface GraphToken {
  token: string;
  expiresAt: number;
}

const graphTokens = new Map<string, GraphToken>();

export type CredentialFailure = 'no-email' | 'unauthorized';

export type CredentialResolution =
  | { ok: true; credentials: UserCredentials }
  | { ok: false; reason: CredentialFailure };

function tenantIdFromActivity(context: TurnContext, config: AppConfig): string | undefined {
  const channelData = context.activity.channelData as { tenant?: { id?: string } } | undefined;
  return channelData?.tenant?.id || context.activity.conversation?.tenantId || config.microsoftAppTenantId;
}

async function getGraphAccessToken(
  tenantId: string,
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  const cached = graphTokens.get(tenantId);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }
  );

  if (!response.ok) {
    console.error(`Graph token request failed (${response.status}) for tenant ${tenantId}`);
    return null;
  }

  const json = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;

  graphTokens.set(tenantId, {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  });
  return json.access_token;
}

async function emailFromGraph(
  aadObjectId: string,
  tenantId: string,
  config: AppConfig
): Promise<string | null> {
  const token = await getGraphAccessToken(
    tenantId,
    config.microsoftAppId,
    config.microsoftAppPassword
  );
  if (!token) return null;

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(aadObjectId)}?$select=mail,userPrincipalName`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    console.error(`Graph user lookup failed (${response.status}) for ${aadObjectId}`);
    return null;
  }

  const json = (await response.json()) as { mail?: string | null; userPrincipalName?: string | null };
  return json.mail || json.userPrincipalName || null;
}

async function emailFromTeams(context: TurnContext, userId: string): Promise<string | null> {
  try {
    const member = await TeamsInfo.getMember(context, userId);
    return member.email || member.userPrincipalName || null;
  } catch (error) {
    console.error(`Failed to fetch Teams member profile for ${userId}:`, error);
    return null;
  }
}

/**
 * Resolves a Teams user to Luzmo credentials from users.json.
 * Prefers Microsoft Graph (`mail`, then `userPrincipalName`) because the
 * Teams roster API no longer returns email addresses.
 */
export async function resolveUserCredentials(
  context: TurnContext,
  userId: string,
  config: AppConfig
): Promise<CredentialResolution> {
  const cached = emailCache.get(userId);
  let email = cached ?? null;

  if (!email) {
    const aadObjectId = context.activity.from?.aadObjectId;
    const tenantId = tenantIdFromActivity(context, config);
    if (aadObjectId && tenantId) {
      email = await emailFromGraph(aadObjectId, tenantId, config);
    }
    if (!email) {
      email = await emailFromTeams(context, userId);
    }
    if (email) emailCache.set(userId, email);
  }

  if (!email) {
    console.warn(`Could not resolve email for Teams user ${userId}`);
    return { ok: false, reason: 'no-email' };
  }

  const credentials = credentialsForEmail(config.users, email);
  if (!credentials) {
    console.warn(`Unauthorized email: ${email} (Teams user ${userId})`);
    return { ok: false, reason: 'unauthorized' };
  }

  return { ok: true, credentials };
}
