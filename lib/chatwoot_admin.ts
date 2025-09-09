// /lib/chatwoot_admin.ts
const CW_BASE = process.env.CHATWOOT_BASE_URL!;
const CW_ACCT = process.env.CHATWOOT_ACCOUNT_ID!;
const CW_KEY = process.env.CHATWOOT_API_KEY!;

async function cwPost(path: string, body: any) {
  const r = await fetch(`${CW_BASE}${path}`, {
    method: "POST",
    headers: {
      "api_access_token": CW_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`chatwoot POST ${path} ${r.status} ${txt}`);
  }
  return r.json();
}

async function cwGet(path: string) {
  const r = await fetch(`${CW_BASE}${path}`, {
    headers: { "api_access_token": CW_KEY },
  });
  if (!r.ok) throw new Error(`chatwoot GET ${path} ${r.status}`);
  return r.json();
}

/**
 * Create a new Agent Bot:
 *  - name: "<BusinessName> Bot"
 *  - outgoing_url (webhook): https://n8n.sost.work/webhook/<BusinessName>
 * Returns: { id, access_token }
 */
export async function createAgentBot(businessName: string) {
  const outgoing_url = `https://n8n.sost.work/webhook/${businessName}`;
  const payload = {
    name: `${businessName} Bot`,
    description: `Bot for ${businessName} demo`,
    outgoing_url,
    // some builds require this flag
    // "bot_config": { "webhook_url": outgoing_url }
  };

  try {
    // API path for agent bots:
    // POST /api/v1/accounts/:account_id/agent_bots
    const data = await cwPost(`/api/v1/accounts/${CW_ACCT}/agent_bots`, payload);
    return { id: data.id, access_token: data.access_token ?? data.accessToken ?? "" };
  } catch (error) {
    // If agent_bots API is not available, throw a specific error
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error('AGENT_BOT_API_NOT_AVAILABLE');
    }
    throw error;
  }
}

/**
 * Assign bot to inbox
 * Try multiple API endpoints and payload formats for maximum compatibility
 */
export async function assignBotToInbox(inboxId: number | string, botId: number | string) {
  const endpoints = [
    // Standard endpoint with simple payload
    { path: `/api/v1/accounts/${CW_ACCT}/inboxes/${inboxId}/agent_bot`, payload: { id: botId } },
    // Alternative payload format
    { path: `/api/v1/accounts/${CW_ACCT}/inboxes/${inboxId}/agent_bot`, payload: { agent_bot: { id: botId } } },
    // Alternative endpoint structure (some Chatwoot versions)
    { path: `/api/v1/accounts/${CW_ACCT}/inboxes/${inboxId}/agent_bots`, payload: { id: botId } },
    // PUT method instead of POST (some versions)
    { path: `/api/v1/accounts/${CW_ACCT}/inboxes/${inboxId}/agent_bot`, payload: { id: botId }, method: 'PUT' },
    // Alternative: Update inbox configuration to include bot
    { path: `/api/v1/accounts/${CW_ACCT}/inboxes/${inboxId}`, payload: { agent_bot_id: botId }, method: 'PATCH' }
  ];

  const errors: string[] = [];

  for (const endpoint of endpoints) {
    try {
      if (endpoint.method === 'PUT') {
        await cwPut(endpoint.path, endpoint.payload);
      } else if (endpoint.method === 'PATCH') {
        await cwPatch(endpoint.path, endpoint.payload);
      } else {
        await cwPost(endpoint.path, endpoint.payload);
      }
      // If we get here, the assignment succeeded
      return;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${endpoint.path} (${endpoint.method || 'POST'}): ${errorMsg}`);
      
      // If it's a 404, the endpoint doesn't exist, continue trying
      // If it's a different error, it might be worth logging but continue
      console.warn(`Bot assignment attempt failed for ${endpoint.path}:`, errorMsg);
    }
  }

  // If all attempts failed, throw a comprehensive error
  throw new Error(`Bot assignment failed for all attempted methods. Errors: ${errors.join('; ')}`);
}

async function cwPut(path: string, body: any) {
  const r = await fetch(`${CW_BASE}${path}`, {
    method: "PUT",
    headers: {
      "api_access_token": CW_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`chatwoot PUT ${path} ${r.status} ${txt}`);
  }
  return r.json();
}

async function cwPatch(path: string, body: any) {
  const r = await fetch(`${CW_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "api_access_token": CW_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`chatwoot PATCH ${path} ${r.status} ${txt}`);
  }
  return r.json();
}
