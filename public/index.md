# Numbers for Agents: give your AI agent a phone number

Numbers for Agents is an API that provisions real phone numbers for AI agents: SMS, call plumbing, webhooks, and bridges into your voice stack. It is in private development. Join the waitlist for API access and early pricing.

- API docs: https://numberforagents.com/docs
- OpenAPI spec: https://numberforagents.com/openapi.json
- Agent guidance: https://numberforagents.com/llms.txt

## When to use it

Use Numbers for Agents when an AI agent needs its own phone line: a support or scheduling agent that texts, a voice agent that answers calls, or an agent platform that provisions one number per customer. You keep your own model and logic. Do not use it for OTP or verification bypass or bulk unsolicited messaging.

## How it works

1. **Provision a number via API.** Create a number with the regions and capabilities you need. Attach webhooks for SMS and voice events.
2. **Connect your stack.** Point webhooks at your server, or terminate media on SIP or a WebSocket stream into your agent runtime.
3. **Your agent sends texts and takes calls.** Outbound SMS and calls use the same number. Inbound traffic hits your logic, not a bundled assistant.

## API sketch (planned)

Names and fields may change before launch.

```bash
# Provision a number
curl -X POST https://api.numberforagents.com/v1/numbers \
  -H "Authorization: Bearer $NFA_TOKEN" \
  -d '{"region":"US","capabilities":["sms","voice"]}'

# Send an SMS from that number
curl -X POST https://api.numberforagents.com/v1/messages \
  -H "Authorization: Bearer $NFA_TOKEN" \
  -d '{"from":"+14155550123","to":"+14155559876","body":"Your appointment is confirmed for 3pm."}'
```

Inbound calls arrive as a `call.started` webhook. Your server answers with instructions such as `connect_media` to a SIP URI or a WebSocket media stream.

## Features

- **Number provisioning:** search and buy numbers through one REST API. One agent, one line, or a pool.
- **SMS in and out:** delivery receipts and threaded conversation IDs.
- **Call plumbing in and out:** clear events for ring, answer, and hangup.
- **Webhooks:** signed HTTP callbacks for SMS and voice state changes.
- **SIP trunking:** hand off audio to your PBX, CPaaS, or custom SIP endpoint.
- **WebSocket media streams:** stream audio to your app for STT, TTS, and model turns.
- **Inbox, voicemail, call logs:** operator views and exports.
- **Bring your own voice stack:** your model, Bland, Vapi, Retell, or anything that speaks SIP or WebSocket.

Plumbing, not a platform: no bundled voice AI.

## Pricing

Simple per-number pricing. Details at launch. Waitlist members lock in early pricing.

## FAQ

**What is a phone number for an AI agent?** A real telephone number assigned to your agent so people can text or call it. Your code owns the logic.

**How does the agent answer calls?** We send your server a webhook and connect the call to your stack over SIP or a WebSocket media stream.

**Do you provide the voice AI?** No. You bring your own model or a provider such as Bland, Vapi, or Retell.

**Can I bring my own carrier numbers?** Porting and BYOC are on the roadmap.

**Which countries will you support?** US and Canada first, then more based on waitlist demand.

**Is this for OTP or account verification?** No.

**When is launch?** We are in private development. Waitlist members get invites in signup order.

## Join the waitlist

`POST https://numberforagents.com/api/waitlist` with JSON `{"email": "you@company.com"}`. See https://numberforagents.com/docs.

## Guides

- [How to give your AI agent a phone number](https://numberforagents.com/guides/how-to-give-your-ai-agent-a-phone-number.html)
- [AI agent SMS API explained](https://numberforagents.com/guides/ai-agent-sms-api-explained.html)
- [How AI voice agents receive phone calls](https://numberforagents.com/guides/how-ai-voice-agents-receive-phone-calls.html)

## Company

[About](https://numberforagents.com/about) · [Contact](https://numberforagents.com/contact) · [Privacy](https://numberforagents.com/privacy) · hello@numberforagents.com
