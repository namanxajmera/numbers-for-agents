# Dial vs AgentCall (2026)

> Dial vs AgentCall: plan fees, AI voice, and SMS prices side by side, plus raw audio, iMessage, caller memory, and which to pick. Checked October 2026.
>
> Source: https://numberforagents.com/compare/dial-vs-agentcall · Updated 2026-10-18 · Numbers for Agents

Dial and AgentCall both give AI agents phone numbers with voice, SMS, and an MCP server. Dial is pure pay as you go and adds iMessage, WhatsApp, and a raw audio mode. AgentCall charges a $19.99 monthly plan fee, then lower SMS prices, and includes caller memory and Canadian numbers.

All prices below are US list prices, checked on October 18, 2026, from each company's public pricing page and docs.

> **Short answer:** pick Dial if you want raw call audio, iMessage, WhatsApp, no plan fee, or a hosted agent at $0.22 per minute. Pick AgentCall if you need Canadian or toll-free numbers, caller memory, cheaper SMS, or AI voice with your own API key at $0.10 per minute.

## Price comparison

| Item | Dial | AgentCall |
|---|---|---|
| Plan fee | None | $19.99/month (Pro) |
| Number | $3/month | from $2/month |
| Hosted AI voice | $0.22/min | $0.40/min |
| AI voice with your own API key | Not offered | $0.10/min |
| Your own agent (text or raw audio) | $0.13/min | Not offered as a separate mode |
| SMS, US | $0.02/message | $0.015 sent, $0.008 received |
| iMessage number | $250/month, messages free | Not offered |
| 10DLC registration | $25 one time per number | Included, "registers for you" |
| Free start | $5 credit, no card | 72-hour trial, card required |

Sources: [Dial pricing](https://getdial.ai/pricing), [AgentCall pricing](https://agentcall.co/pricing).

## What a month costs

For one US number, 500 minutes of hosted AI voice, and 1,000 texts sent:

| | Dial | AgentCall, managed voice | AgentCall, your own API key |
|---|---|---|---|
| Plan fee | $0 | $19.99 | $19.99 |
| Number | $3 | $2 | $2 |
| 500 AI minutes | $110 | $200 | $50 |
| 1,000 texts sent | $20 | $15 | $15 |
| **Total** | **$133** | **about $237** | **about $87** |

The "your own API key" column does not include the bill from your model provider. Dial's free tier caps calls at 5 minutes until the first top-up.

## How voice reaches your code

**Dial** has a hosted mode and two self-hosted modes. In LLM mode, your server returns text turns over a WebSocket. In audio mode, Dial streams full-duplex raw audio in G.711 or PCM at 8 to 24 kHz, so you can run your own speech models. Both self-hosted modes need per-account approval. Audio mode produces no transcripts or recordings.

**AgentCall** runs the AI voice itself. Your code receives webhooks such as `call.transcript` and `call.report.ready`, plus a pre-call webhook to send context before a call. We found no raw audio stream and no SIP endpoint in its API spec.

For a team with its own speech pipeline, Dial is the only one of the two that streams raw audio. See [how AI voice agents receive phone calls](https://numberforagents.com/guides/how-ai-voice-agents-receive-phone-calls).

## Numbers and channels

| | Dial | AgentCall |
|---|---|---|
| Number countries | US only | US and Canada |
| Toll-free numbers | Not documented | Yes |
| Voice | Yes | Yes |
| SMS | Yes | Yes |
| iMessage | Yes | No |
| WhatsApp | Beta | No |
| Caller memory | Not documented | Yes, every plan |
| International SMS | Tiers from $0.10 to $1.00 | Not documented |

## Developer tooling

| | Dial | AgentCall |
|---|---|---|
| MCP server | Remote with OAuth 2.1, or local stdio, 26 tools | Hosted, 62 tools and 5 prompts |
| SDKs | Node, Python | Not found |
| CLI | Yes, `dial` | Not found |
| Framework integrations | LangChain, Vercel AI SDK, CrewAI, AutoGen | Not documented |
| Webhook signing | HMAC-SHA256, 6 attempts | Not documented |
| Provisioning limits | Not documented | 10 numbers per hour, 100 per day |

## SMS registration

Dial registers each number for A2P 10DLC for $25 one time. Approval takes 3 to 5 business days, and a resubmission after rejection is free. AgentCall registers for you and says verified senders can text the same day. See the [A2P 10DLC guide](https://numberforagents.com/guides/a2p-10dlc-registration-for-ai-agents).

## Free tiers

**Dial** gives $5 of credit with no card. Free accounts are capped at 5 minutes per call and 2 concurrent calls until the first top-up.

**AgentCall** gives a 72-hour trial after card verification: one US number, 5 managed AI minutes, and 5 texts to verified numbers. Outbound calls and live OTP extraction need Pro.

## Which to choose

- **Choose Dial** if you want raw audio for your own speech models, iMessage or WhatsApp, a CLI and SDKs, or no plan fee.
- **Choose AgentCall** if you need Canadian or toll-free numbers, want caller memory built in, send a lot of SMS, or bring your own API key for voice.
- **Compare a third option** if you need Canadian numbers and iMessage together. See [AgentPhone vs Dial](https://numberforagents.com/compare/agentphone-vs-dial).

Numbers for Agents is building a number API designed for agents, with SMS, signed webhooks, SIP, and raw WebSocket audio. It is in private beta. Join the waitlist below if you want to compare it when it opens.

## FAQ

### Is Dial or AgentCall cheaper?

It depends on the voice mode. For a hosted agent, Dial is cheaper at $0.22 per minute against AgentCall's $0.40. With your own API key, AgentCall's $0.10 per minute is lower, plus your model bill. For SMS, AgentCall is cheaper. AgentCall also charges $19.99 per month for Pro.

### Which one streams raw call audio?

Dial, through its self-hosted audio mode, after account approval. We found no raw audio stream in AgentCall's API spec.

### Which one supports Canadian numbers?

AgentCall. Dial sells US numbers only.

### Do both have an MCP server?

Yes. Dial has a remote MCP server with OAuth 2.1 and 26 tools, plus a local one through its CLI. AgentCall's hosted MCP server has 62 tools and 5 prompts. See [give a Claude or MCP agent a phone number](https://numberforagents.com/guides/give-claude-mcp-agent-a-phone-number).
