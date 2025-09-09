// /lib/n8n.ts
export type N8nWorkflow = any;

const N8N_BASE = process.env.N8N_BASE_URL!;
const N8N_KEY = process.env.N8N_API_KEY!;

async function n8nGet(path: string) {
  const r = await fetch(`${N8N_BASE}${path}`, {
    headers: { "X-N8N-API-KEY": N8N_KEY },
  });
  if (!r.ok) throw new Error(`n8n GET ${path} ${r.status}`);
  return r.json();
}

async function n8nPost(path: string, body: any) {
  const r = await fetch(`${N8N_BASE}${path}`, {
    method: "POST",
    headers: {
      "X-N8N-API-KEY": N8N_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`n8n POST ${path} ${r.status} ${txt}`);
  }
  return r.json();
}

export async function getWorkflow(id: string): Promise<N8nWorkflow> {
  return n8nGet(`/rest/workflows/${id}`);
}

export async function createWorkflow(payload: N8nWorkflow): Promise<N8nWorkflow> {
  return n8nPost(`/rest/workflows`, payload);
}

/**
 * Patch helpers:
 * - inject system message into the main chat node (supports 3 common shapes)
 * - set webhook node path to <businessName> and ensure production URL matches our BASE/webhook/<businessName>
 * - insert bot token into all Chatwoot HTTP nodes (header variants supported)
 */
export function patchWorkflowForBusiness(
  wf: N8nWorkflow,
  businessName: string,
  systemMessage: string,
  botAccessToken: string
) {
  const webhookPath = businessName;
  const webhookProdUrl = `${N8N_BASE}/webhook/${businessName}`;

  for (const n of wf.nodes ?? []) {
    const name = (n.name || "").toLowerCase();

    // 1) System message injection (Main AI / Agent)
    if (name.includes("main ai") || name.includes("agent")) {
      if (n.parameters?.systemMessage !== undefined) {
        n.parameters.systemMessage = systemMessage;
      }
      if (n.parameters?.messages?.length) {
        const sys = n.parameters.messages.find((m: any) => (m.type || "").toLowerCase() === "system");
        if (sys) sys.text = systemMessage;
      }
      if (n.parameters?.options?.additionalFields) {
        n.parameters.options.additionalFields.systemMessage = systemMessage;
      }
    }

    // 2) Webhook node path + production URL
    if (name.includes("webhook")) {
      if (!n.parameters) n.parameters = {};
      // Common params
      n.parameters.path = webhookPath;
      // Some builds store production URL under options or authentication settings—set the basics:
      if (!n.parameters.options) n.parameters.options = {};
      n.parameters.options.webhookUrl = webhookProdUrl;
    }

    // 3) Ensure Chatwoot HTTP POST nodes carry the bot token
    //    We detect by node name or baseUrl; set headers accordingly.
    const isHttp = (n.type || "").toLowerCase().includes("http");
    const baseUrl = (n.parameters?.url || n.parameters?.options?.url || "").toLowerCase();
    const looksLikeChatwoot = baseUrl.includes("chatwoot");

    if (isHttp && looksLikeChatwoot) {
      // Normalize headers shape across n8n versions
      n.parameters = n.parameters || {};
      n.parameters.options = n.parameters.options || {};
      n.parameters.options.headers = n.parameters.options.headers || [];

      const headers = n.parameters.options.headers as Array<{ name: string; value: string }>;

      function upsertHeader(k: string, v: string) {
        const idx = headers.findIndex(h => h.name.toLowerCase() === k.toLowerCase());
        if (idx >= 0) headers[idx].value = v;
        else headers.push({ name: k, value: v });
      }

      // Support both header styles Chatwoot accepts in different setups:
      //  - api_access_token (classic)
      //  - Authorization: Bearer <token>
      upsertHeader("api_access_token", botAccessToken);
      upsertHeader("Authorization", `Bearer ${botAccessToken}`);
      // JSON content type if missing
      upsertHeader("Content-Type", "application/json");
    }
  }
}
