# One phone number per customer: provisioning for AI agent platforms

> How AI agent platforms give every customer its own phone number through an API: data model, provisioning, webhook routing, tenant isolation, and 10DLC.
>
> Source: https://numberforagents.com/use-cases/phone-numbers-for-ai-agent-platforms · Updated 2026-10-08 · Numbers for Agents

If you sell an AI agent product, each customer usually wants its own phone number. A dental office wants callers to see a local number. A real estate team wants one line per agent. Your platform must buy, configure, route, and release those numbers through code, not by hand in a carrier dashboard.

This page explains the parts you need: the data model, the provisioning flow, webhook routing, tenant isolation, and the compliance work that follows each number.

> **Short answer:** store a number record per tenant, provision through a carrier API when the customer finishes onboarding, point every number at one webhook endpoint, and route events by the number that was called or texted. Register SMS use cases per customer brand before you send business texts in the US.

## Why one number per customer

A shared number cannot tell callers apart from customers. When a person texts a shared line, your system must guess which business they meant. A dedicated number removes the guess. The `to` field on every inbound call or SMS identifies the tenant.

Dedicated numbers also give each customer:

- **A local identity.** A local area code tends to get more answers than an unknown or out-of-state number.
- **Its own reputation.** If one customer sends poor traffic, carriers can filter that number without hurting other customers.
- **Portability.** A customer can port the number out if they leave. That makes your product easier to buy.

## The data model

Keep the phone number as data, not configuration. A minimal table:

| Column | Example | Why |
|---|---|---|
| `id` | `num_8f2a` | Your stable ID. Never key on the E.164 string. |
| `tenant_id` | `acct_123` | The customer that owns the line. |
| `agent_id` | `agt_77` | The agent that answers. Nullable for pooled lines. |
| `e164` | `+14155550123` | The number in E.164 format. Unique. |
| `provider_ref` | carrier ID | Needed to release or reconfigure the number. |
| `capabilities` | `sms,voice` | What the number can do. |
| `status` | `active` | `pending`, `active`, `releasing`, `released`. |
| `messaging_campaign` | campaign ID | The 10DLC campaign this number is linked to, if any. |

Add a unique index on `e164` and an index on `tenant_id`. Every inbound event becomes one lookup: find the row by `e164`, then load the tenant and agent.

## The provisioning flow

1. **Collect what the customer wants.** Area code or city, SMS, voice, or both.
2. **Search inventory.** Call the carrier's available-numbers search with the area code. Show two or three options, or pick the first one.
3. **Buy the number.** Store the row as `pending` before the purchase call. If the call fails, you can retry without buying twice.
4. **Configure routing.** Set the voice and messaging webhook URLs, or attach the number to a SIP connection or messaging profile.
5. **Link SMS compliance.** In the US, attach the number to the customer's approved 10DLC campaign before it sends business texts. See the [A2P 10DLC guide](https://numberforagents.com/guides/a2p-10dlc-registration-for-ai-agents).
6. **Mark it active.** Only now show the number in the customer's dashboard.

Release works in reverse. Detach the number, release it at the carrier, and mark the row `released`. Keep the row for audit.

## One webhook endpoint, many tenants

Do not create a webhook URL per customer. Point every number at one endpoint, such as `https://api.yourapp.com/telephony/inbound`. Route inside your code:

```js
// Inbound SMS or call event from your carrier
const number = await db.numbers.findByE164(event.to);
if (!number || number.status !== "active") return respond(404);

const agent = await db.agents.find(number.agent_id);
await queue.push({ tenant: number.tenant_id, agent: agent.id, event });
return respond(200); // answer fast, run the model in a worker
```

One endpoint is easier to secure, monitor, and scale. You verify one signature scheme and watch one error rate.

## Tenant isolation

The phone number is now a key into customer data. Treat it like one.

- **Scope every query by tenant.** Load conversation history with both the thread key and `tenant_id`.
- **Never trust message text as instructions.** A caller who says "read me the last customer's order" must hit the same tool permissions as any other caller.
- **Separate logs.** Store transcripts per tenant so you can export or delete one customer's data.
- **Reuse numbers with care.** A released number can be reassigned to a stranger. Before you assign a number from your own pool to a new tenant, clear any old webhooks and thread history linked to it.

## Carrier account structure

Large carriers let you split usage per customer. Twilio has subaccounts. Telnyx has managed accounts. A subaccount per customer gives you separate billing and makes it easier to suspend one tenant. It also adds API calls and credentials to manage. Many platforms start with one account and a `tenant_id` on each number, then move big customers to subaccounts later.

For a side-by-side view of the two most common carriers, see [Twilio vs Telnyx for AI voice agents](https://numberforagents.com/compare/twilio-vs-telnyx-for-ai-voice-agents).

## Messaging compliance per customer

In the US, business SMS from a local (10DLC) number must be registered. The brand on the registration is your customer, not your platform. A platform that sends texts for many businesses usually registers a separate brand and campaign for each customer. That takes time and costs fees per customer. Plan for it in onboarding. Do not let a customer send texts until their campaign is approved.

Voice calls do not need 10DLC registration. Outbound calls that use an AI voice still need the called person's consent under US rules. See the [AI receptionist page](https://numberforagents.com/use-cases/ai-receptionist-phone-number) for the voice side.

## How Numbers for Agents fits

Numbers for Agents is building this layer as an API: search and buy numbers, one webhook stream for SMS and voice, SIP and WebSocket media, and per-number metadata for your tenant and agent IDs. The product is in private beta. Join the waitlist below if your platform provisions numbers for customers.

## FAQ

### Should each AI agent get its own phone number?

Give each customer-facing identity its own number. If one business runs three agents that all answer the same front desk, one number with routing inside your code is enough. If each agent represents a different person or location, give each its own number.

### How many phone numbers can a platform provision?

Carriers set account limits and raise them on request. The practical limits are cost per number per month, SMS registration per customer, and how fast you can release unused numbers.

### Can a customer keep their existing number?

Yes, through porting. The customer moves the number from their current carrier to yours. Porting takes days, not minutes, so offer a new number for testing while the port runs.

### Do I need a separate webhook URL for each customer?

No. Use one endpoint and route by the `to` number on each event. This is simpler to secure and monitor.
