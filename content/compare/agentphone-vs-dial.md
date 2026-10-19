---
title: AgentPhone vs Dial for AI Agent Phone Numbers (2026)
description: AgentPhone vs Dial (getdial.ai): number, voice, SMS, and iMessage prices side by side, plus raw audio, SIP, MCP, and which to pick. Checked October 2026.
h1: AgentPhone vs Dial (2026)
published: 2026-10-18
updated: 2026-10-18
order: 7
related: /compare/agentphone-alternatives, /compare/dial-alternatives, /compare/best-phone-number-apis-for-ai-agents
---

AgentPhone and Dial are the two agent-first phone APIs that look most alike. Both charge $3 per number, $0.13 per minute when your own agent drives the call, and $0.22 per minute for a hosted agent. Both sell iMessage, WhatsApp (beta), MCP servers, and Node and Python SDKs. The differences are in how voice reaches your code, which countries you can get numbers in, and the extra channels.

All prices below are US pay-as-you-go list prices, checked on October 18, 2026, from each company's public pricing page and docs.

> **Short answer:** pick Dial if you want raw call audio for your own speech pipeline, or a CLI. Pick AgentPhone if you need Canadian numbers, MMS, RCS, SIP, or an inbound-only iMessage line at $150 per month. For text-in, text-out voice and SMS, the two cost the same.

## Price comparison

| Item | AgentPhone | Dial |
|---|---|---|
| Number | $3/month | $3/month |
| Voice, your own agent | $0.13/min | $0.13/min |
| Voice, hosted agent | $0.22/min | $0.22/min |
| SMS, US | $0.02/segment, in and out | $0.02/message |
| MMS | $0.03 | Not documented |
| iMessage line | $150/month inbound only, $250/month send and receive | $250/month, messages free |
| WhatsApp | Beta, $0 per message plus Meta fees | Beta, price not listed |
| International SMS | About 200 countries, priced per country | Tiers from $0.10 to $1.00 |
| 10DLC registration | $25 standard brand, $70 high volume | $25 one time per number |
| SIP trunking | Request access, 0.374¢/min in, 1.98¢/min out | Not documented |
| Call recording | $5/month per account | Not documented |
| Free credit | $5, no card | $5, no card |

Sources: [AgentPhone pricing](https://agentphone.ai/pricing), [AgentPhone usage](https://docs.agentphone.ai/usage.md), [Dial pricing](https://getdial.ai/pricing), [Dial phone numbers](https://docs.getdial.ai/documentation/platform/manage-phone-numbers.md).

## How voice reaches your code

This is the main difference between the two.

**AgentPhone** has one self-hosted mode. Your webhook receives what the caller said as text (`agent.message` events). You reply with text, and AgentPhone speaks it. Live transcripts also stream over SSE. We found no raw audio WebSocket in its docs.

**Dial** has two self-hosted modes, both over a WebSocket. In LLM mode, Dial handles speech-to-text, text-to-speech, and turn-taking, and your server returns text turns. In audio mode, Dial streams full-duplex raw audio in G.711 or PCM at 8 to 24 kHz, and you run your own speech models. Audio mode works with Pipecat Cloud. It produces no transcripts or recordings. Both modes need per-account approval.

If you already run a speech pipeline, Dial's audio mode lets you keep your own models and voice. See [how AI voice agents receive phone calls](/guides/how-ai-voice-agents-receive-phone-calls).

## Numbers and channels

| | AgentPhone | Dial |
|---|---|---|
| Number countries | US and Canada | US only |
| Voice | Yes | Yes |
| SMS | Yes | Yes |
| MMS | Yes | Not documented |
| iMessage | Yes | Yes |
| WhatsApp | Beta | Beta |
| RCS | Beta | Not documented |

Both cap iMessage at 50 new conversations per day per line.

## Developer tooling

| | AgentPhone | Dial |
|---|---|---|
| MCP server | Hosted, 26 tools | Remote with OAuth 2.1, or local stdio, 26 tools |
| SDKs | TypeScript, Python (Go repo on GitHub) | Node, Python |
| CLI | Not documented | Yes, `dial` |
| Framework integrations | Not documented | LangChain, Vercel AI SDK, CrewAI, AutoGen |
| Webhook signing | HMAC-SHA256, 5-minute window, 6 attempts | HMAC-SHA256, 6 attempts, 10 s timeout |

## SMS registration

Both help with A2P 10DLC. AgentPhone files registration for you through its API (`POST /v1/register`). Approval takes 7 to 10 business days. Dial registers each number for $25 one time, takes 3 to 5 business days, and resubmits for free after a rejection. Carrier fees apply on both. See the [A2P 10DLC guide](/guides/a2p-10dlc-registration-for-ai-agents).

## Limits

- **Dial** caps free accounts at 5 minutes per call and 2 concurrent calls. Both caps lift on the first top-up.
- **AgentPhone** needs a top-up before outbound calls. Calls hang up after 10 minutes of silence by default. Self-serve accounts have a cap on numbers.

## Which to choose

- **Choose Dial** if you want raw audio for your own speech models, a CLI, or framework integrations.
- **Choose AgentPhone** if you need Canadian numbers, MMS, RCS, SIP, or an inbound-only iMessage line.
- **Either works** for text-in, text-out voice and SMS at the same price.
- **Choose neither** if voice cost per minute matters most. A carrier with a raw audio stream costs about 1 to 2 cents per minute. See [Twilio vs Telnyx](/compare/twilio-vs-telnyx-for-ai-voice-agents).

Numbers for Agents is building a number API designed for agents, with SMS, signed webhooks, SIP, and raw WebSocket audio. It is in private beta. Join the waitlist below if you want to compare it when it opens.

## FAQ

### Is AgentPhone or Dial cheaper?

Neither, for the core items. Both charge $3 per number, $0.13 per minute for your own agent, $0.22 per minute for a hosted agent, and $0.02 per US SMS. AgentPhone is cheaper for an inbound-only iMessage line at $150 per month.

### Which one streams raw call audio?

Dial, through its self-hosted audio mode, after account approval. We did not find a raw audio stream in AgentPhone's docs.

### Do AgentPhone and Dial work outside the US?

AgentPhone sells US and Canadian numbers. Dial sells US numbers only. Both send international SMS.

### Can I connect AgentPhone or Dial to Vapi or Retell?

Vapi and Retell import carrier numbers or accept calls over SIP. AgentPhone offers SIP trunking on request. We did not find SIP in Dial's docs.
