---
title: AgentPhone vs AgentCall for AI Agent Phone Numbers (2026)
description: AgentPhone vs AgentCall: plan fees, AI voice, and SMS prices side by side, plus channels, caller memory, MCP, and which to pick. Checked October 2026.
h1: AgentPhone vs AgentCall (2026)
published: 2026-10-18
updated: 2026-10-18
order: 8
related: /compare/agentphone-alternatives, /compare/agentcall-alternatives, /compare/best-phone-number-apis-for-ai-agents
---

AgentPhone and AgentCall both give AI agents phone numbers with voice, SMS, and an MCP server. They price in different ways. AgentPhone is pure pay as you go. AgentCall charges a $19.99 monthly plan fee, then lower SMS prices and a choice of AI voice prices. AgentPhone covers more channels. AgentCall includes caller memory.

All prices below are US list prices, checked on October 18, 2026, from each company's public pricing page and docs.

> **Short answer:** pick AgentPhone if you need iMessage, WhatsApp, or MMS, want no plan fee, or want a hosted agent at $0.22 per minute. Pick AgentCall if SMS volume and caller memory matter most, or if you bring your own API key for AI voice at $0.10 per minute.

## Price comparison

| Item | AgentPhone | AgentCall |
|---|---|---|
| Plan fee | None | $19.99/month (Pro) |
| Number | $3/month | from $2/month |
| Hosted AI voice | $0.22/min | $0.40/min |
| AI voice with your own API key | Not offered | $0.10/min |
| Your own agent, text over webhook | $0.13/min | Not offered as a separate mode |
| Plain voice, no AI | Not listed | $0.035/min |
| SMS sent | $0.02/segment | $0.015 |
| SMS received | $0.02/segment | $0.008 |
| MMS | $0.03 | Not documented |
| Call recording | $5/month per account | $0.01/min |
| Free start | $5 credit, no card | 72-hour trial, card required |

Sources: [AgentPhone pricing](https://agentphone.ai/pricing), [AgentCall pricing](https://agentcall.co/pricing).

## What a month costs

For one US number, 500 minutes of hosted AI voice, 1,000 texts sent, and 1,000 texts received:

| | AgentPhone | AgentCall, managed voice | AgentCall, your own API key |
|---|---|---|---|
| Plan fee | $0 | $19.99 | $19.99 |
| Number | $3 | $2 | $2 |
| 500 AI minutes | $110 | $200 | $50 |
| 1,000 texts sent | $20 | $15 | $15 |
| 1,000 texts received | $20 | $8 | $8 |
| **Total** | **$153** | **about $245** | **about $95** |

The "your own API key" column does not include the bill from your model provider. At low volume, AgentPhone's lack of a plan fee wins. At high SMS volume, AgentCall's lower SMS prices win.

## How voice reaches your code

**AgentPhone** has two modes. In webhook mode, your server receives the caller's words as text and replies with text, for $0.13 per minute. In hosted mode, AgentPhone runs the agent for $0.22 per minute. Live transcripts stream over SSE.

**AgentCall** runs the AI voice itself, on OpenAI Realtime voices. Your code receives webhooks such as `call.transcript` and `call.report.ready`, and a pre-call webhook lets you send context before a call starts. We found no raw audio stream and no SIP endpoint in its API spec.

Neither documents a raw audio WebSocket. If you run your own speech models, see [Dial](/compare/agentphone-vs-dial) or a carrier with a media stream.

## Numbers and channels

| | AgentPhone | AgentCall |
|---|---|---|
| Number countries | US and Canada | US and Canada |
| Toll-free numbers | Not documented | Yes |
| Voice | Yes | Yes |
| SMS | Yes | Yes |
| MMS | Yes | Not documented |
| iMessage | Yes, $150 to $250/month per line | No |
| WhatsApp | Beta | No |
| RCS | Beta | No |
| Caller memory | Not documented | Yes, every plan |
| AI voice languages | 63 locales | 31 languages plus auto-detect |

## Developer tooling

| | AgentPhone | AgentCall |
|---|---|---|
| MCP server | Hosted, 26 tools | Hosted, 62 tools and 5 prompts |
| SDKs | TypeScript, Python | Not found |
| Webhook signing | HMAC-SHA256 | Not documented |
| Provisioning limits | Self-serve cap per account | 10 numbers per hour, 100 per day |

## SMS registration

AgentPhone files A2P 10DLC registration through its API. Fees are $25 for a standard brand and $70 for high volume, and approval takes 7 to 10 business days. AgentCall registers for you and says verified senders can text the same day. See the [A2P 10DLC guide](/guides/a2p-10dlc-registration-for-ai-agents).

## OTP extraction

AgentCall has an endpoint that waits up to 60 seconds for a one-time code to arrive by SMS. AgentCall frames it as QA testing of your own app's SMS verification. Live OTP extraction needs Pro. We did not find a similar feature in AgentPhone's docs.

## Which to choose

- **Choose AgentPhone** if you need iMessage, WhatsApp, MMS, or RCS, want no plan fee, or want a hosted agent at $0.22 per minute.
- **Choose AgentCall** if you send and receive a lot of SMS, want caller memory built in, need toll-free numbers, or bring your own API key for voice.
- **Choose neither** if you run your own speech pipeline. See [AgentPhone alternatives](/compare/agentphone-alternatives) and [AgentCall alternatives](/compare/agentcall-alternatives).

Numbers for Agents is building a number API designed for agents, with SMS, signed webhooks, SIP, and raw WebSocket audio. It is in private beta. Join the waitlist below if you want to compare it when it opens.

## FAQ

### Is AgentCall cheaper than AgentPhone?

For SMS, yes: $0.015 sent and $0.008 received, against $0.02 each way on AgentPhone. For hosted AI voice, no: $0.40 per minute against $0.22. AgentCall also charges $19.99 per month for Pro.

### Does AgentPhone or AgentCall have a free tier?

AgentPhone gives $5 of credit with no card. AgentCall gives a 72-hour trial with one number, 5 AI minutes, and 5 texts, after card verification.

### Which one supports iMessage?

AgentPhone. An inbound-only iMessage line costs $150 per month, and a line that also sends costs $250 per month. AgentCall does not offer iMessage.

### Do both have an MCP server?

Yes. AgentPhone's hosted MCP server has 26 tools. AgentCall's has 62 tools and 5 prompts. See [give a Claude or MCP agent a phone number](/guides/give-claude-mcp-agent-a-phone-number).
