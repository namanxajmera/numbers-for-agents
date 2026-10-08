# Best phone number APIs for AI agents (2026)

> Compare phone number APIs for AI agents: AgentPhone, Dial, AgentCall, Bland, Twilio, Telnyx. Prices, raw audio, SIP, MCP, and 10DLC, checked October 2026.
>
> Source: https://numberforagents.com/compare/best-phone-number-apis-for-ai-agents · Updated 2026-10-08 · Numbers for Agents

An AI agent that texts or talks to people needs a real phone number. In 2026 you can get one from two kinds of company. **Agent-first APIs** such as AgentPhone, Dial, AgentCall, and Saperly sell a number plus a ready-made agent layer. **Carriers and CPaaS platforms** such as Twilio and Telnyx sell raw telecom building blocks that you assemble yourself.

This page compares them on what matters to a developer: price, how voice reaches your code, raw audio access, SIP, MCP, and SMS registration. Every price comes from the vendor's public pricing page, checked on October 8, 2026.

> **Short answer:** pick an agent-first API if you want text-in, text-out voice and SMS with almost no telecom work. Pick Twilio or Telnyx if you run your own speech pipeline and want raw call audio at the lowest per-minute cost. The agent-first APIs charge about $0.13 per minute for voice. Carrier voice plus a WebSocket audio stream costs about 1 to 2 cents per minute.

## Comparison table

| Provider | Number / month | Voice, your own agent | SMS (US) | Raw audio to your code | SIP | MCP server |
|---|---|---|---|---|---|---|
| AgentPhone | $3 | $0.13/min | $0.02/segment | Not documented | On request | Yes |
| Dial | $3 | $0.13/min | $0.02/message | "Own LLM over WebSocket" | Not documented | Yes |
| AgentCall | from $2 (Pro plan $19.99/mo) | $0.035/min voice, $0.10/min AI voice with your key | $0.015 sent | Not documented | Not documented | Yes |
| Saperly | from $2 | $0.13/min | $0.02/segment | Not documented | Not documented | Yes |
| Bland Agent Phone Plan | $29.99/mo bundle | Included (1 concurrent call, 50 calls/day) | Included (100 texts/day) | No, Bland runs the agent | No | Yes |
| Twilio | $1.15 | $0.0085 to $0.014/min + $0.0044/min stream | $0.0083/segment + carrier fee | Yes, Media Streams | Yes | Docs only (official) |
| Telnyx | $1.00 | about $0.005 to $0.007/min + $0.0035/min stream | $0.004/part + carrier fee | Yes, media streaming | Yes | Yes |

Prices are US list prices for pay-as-you-go accounts. "Not documented" means we did not find it in the vendor's public docs on October 8, 2026. It does not mean the feature cannot exist.

## How voice reaches your code

This is the biggest difference between the options, and the pricing pages hide it.

**Text over webhook.** The provider runs speech-to-text and text-to-speech. Your server receives what the caller said as text and replies with text. AgentPhone documents this as its "webhook mode". It is the fastest way to start. You do not choose the speech models, the voice, or how interruptions work.

**Raw audio over WebSocket.** The provider streams the call's audio frames to your server, and you stream audio back. You choose the speech-to-text model, the LLM, the voice, and the turn-taking logic. Twilio Media Streams and Telnyx media streaming both work this way, and both are bidirectional. This is the path for teams that already run a voice pipeline, such as an agent built on LiveKit or Pipecat. See [how AI voice agents receive phone calls](https://numberforagents.com/guides/how-ai-voice-agents-receive-phone-calls).

**SIP.** The provider hands the call to your SIP endpoint. Voice platforms such as Vapi, Retell, and LiveKit accept SIP. Twilio and Telnyx sell SIP trunking. AgentPhone lists SIP trunking as "request access".

**Hosted agent.** The provider runs the whole agent. AgentPhone charges $0.22 per minute and Dial charges $0.22 per minute for this. Saperly charges $0.26 per minute.

## Provider notes

### AgentPhone

A Y Combinator Spring 2026 company. US and Canada numbers. Channels: SMS, MMS, iMessage, voice, and WhatsApp Business. One HMAC-signed webhook covers calls and messages. Has an MCP server, Node and Python SDKs, and API endpoints for 10DLC registration. iMessage lines cost $150 to $250 per month. Every account starts with $5 of credit. [Pricing](https://agentphone.ai/pricing).

### Dial

Voice, SMS, iMessage, and WhatsApp (beta) through a REST API, a remote MCP server, SDKs, and a CLI. Its self-hosted voice mode is described as "your own LLM over WebSocket". Free accounts get $5 of credit and are capped at 5 minutes per call and 2 concurrent calls until the first top-up. 10DLC registration is done in the dashboard for a one-time fee. [Pricing](https://getdial.ai/pricing).

### AgentCall

Numbers, SMS, AI voice, and caller memory in one API, with a hosted MCP server. The free plan is a 72-hour trial with one number. Pro is $19.99 per month plus usage. Its site also offers OTP extraction, framed as QA testing of your own app's SMS verification. [Site](https://agentcall.co/).

### Saperly

Positions itself as "a phone carrier for AI agents" with compliance as the main feature: AI disclosure, consent checks at call time, an audit trail, and STOP/HELP handling. 10DLC registration is part of number provisioning. [Site](https://saperly.com).

### Bland Agent Phone Plan

Bland sells a bundle for agents: one US number with voice and SMS to the US and Canada for $29.99 per month ($14.99 the first month). Bland's own voice agent runs the calls. The plan has hard caps: 1 concurrent call, 50 calls per day, and 100 texts per day. An agent can sign itself up. It suits a personal or test agent, not production volume. [Docs](https://docs.bland.ai/platform/agent-phone-plan).

### Twilio

The default choice for most teams. Local numbers cost $1.15 per month. Media Streams sends raw call audio over WebSockets for $0.0044 per minute, and ConversationRelay handles speech for you at $0.07 per minute. Twilio has the widest documentation and the most voice-platform integrations. See [Twilio vs Telnyx for AI voice agents](https://numberforagents.com/compare/twilio-vs-telnyx-for-ai-voice-agents). [Voice pricing](https://www.twilio.com/en-us/voice/pricing/us).

### Telnyx

Lower list prices than Twilio on numbers, SMS, and voice. Media streaming over WebSockets costs $0.0035 per minute and supports codecs up to OPUS and L16. Telnyx says it owns its network and holds its own carrier licenses. [Call Control pricing](https://telnyx.com/pricing/call-control).

## Cost of 1,000 minutes of voice

A rough comparison for one US number and 1,000 inbound minutes per month, when you run your own agent:

| Option | Number | 1,000 minutes | Total |
|---|---|---|---|
| AgentPhone (webhook mode) | $3 | $130 | about $133 |
| Dial (self-hosted) | $3 | $130 | about $133 |
| Twilio + Media Streams | $1.15 | $8.50 + $4.40 | about $14 |
| Telnyx + media streaming | $1.00 | about $5.20 + $3.50 | about $10 |

The carrier totals do not include your speech-to-text, LLM, and text-to-speech costs. The agent-first prices include speech. Compare total cost per minute after you add your model bills. For many teams, the agent-first price is cheaper until volume grows, because it saves engineering time.

## Which one to choose

- **You want a working phone agent this week and do not run speech models:** an agent-first API such as AgentPhone or Dial.
- **You need iMessage:** AgentPhone or Dial. Carriers do not sell iMessage lines.
- **You already run Vapi, Retell, or LiveKit:** a carrier number imported into that platform. See [Vapi phone numbers](https://numberforagents.com/compare/vapi-phone-numbers-free-vs-twilio-vs-telnyx).
- **You run your own speech pipeline and care about cost per minute:** Twilio or Telnyx with a WebSocket media stream.
- **You provision numbers for many customers:** read [one number per customer](https://numberforagents.com/use-cases/phone-numbers-for-ai-agent-platforms) first. Account structure and SMS registration matter more than the per-minute price.

## Where Numbers for Agents fits

Numbers for Agents is building the plumbing layer: numbers, SMS, signed webhooks, SIP, and raw WebSocket audio, with no bundled assistant. It targets teams that bring their own voice stack and want an API designed for agents. It is in private beta, with no public pricing yet. It is not on the comparison table because nothing is live to compare. Join the waitlist below to get access.

## FAQ

### What is the cheapest way to give an AI agent a phone number?

A carrier number. Telnyx lists US local numbers at $1.00 per month and Twilio at $1.15 per month. Plivo and SignalWire list $0.50 per month. You then pay per minute and per message, and you build the speech layer yourself.

### Which phone APIs have an MCP server?

AgentPhone, Dial, AgentCall, Saperly, and Bland offer one. Telnyx has a remote MCP server that can call its full API, including buying numbers. Twilio's official MCP server only searches Twilio's docs. Its older `@twilio-alpha/mcp` package can call the API, but Twilio labels it a proof of concept. An MCP server lets a coding agent such as Claude Code buy numbers and send messages through tool calls. See [give a Claude or MCP agent a phone number](https://numberforagents.com/guides/give-claude-mcp-agent-a-phone-number).

### Do agent-first phone APIs handle 10DLC registration?

Some help with it. AgentPhone has registration API endpoints. Dial registers through its dashboard for a one-time fee. Saperly includes registration in provisioning. Carrier fees still apply in every case. See the [A2P 10DLC guide](https://numberforagents.com/guides/a2p-10dlc-registration-for-ai-agents).

### Can I use an agent-first number with Vapi or Retell?

Usually not directly. Vapi and Retell import numbers from carriers such as Twilio and Telnyx, or accept calls over SIP. Check whether the agent-first provider offers SIP before you plan on it.
