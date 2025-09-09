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
 *  - POST /api/v1/accounts/:account_id/inboxes/:inbox_id/agent_bot
 *  - body: { id: <bot_id> }  (some builds expect { agent_bot: { id } })
 */
export async function assignBotToInbox(inboxId: number | string, botId: number | string) {
  try {
    await cwPost(`/api/v1/accounts/${CW_ACCT}/inboxes/${inboxId}/agent_bot`, { id: botId });
  } catch (error) {
    try {
      // fallback shape
      await cwPost(`/api/v1/accounts/${CW_ACCT}/inboxes/${inboxId}/agent_bot`, { agent_bot: { id: botId } });
    } catch (fallbackError) {
      // If both fail, surface the original API response
      const originalError = error instanceof Error ? error.message : 'Unknown error';
      const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
      throw new Error(`Bot assignment failed. Original: ${originalError}. Fallback: ${fallbackErrorMsg}`);
    }
  }
}
