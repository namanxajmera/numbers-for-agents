# AI agent SMS API explained

> Learn how SMS APIs work for AI agents: sending, receiving, webhooks, threading, delivery receipts, and design patterns for conversational text agents.
>
> Source: https://numberforagents.com/guides/ai-agent-sms-api-explained · Updated 2026-10-08 · Numbers for Agents

SMS is still the lowest-friction channel for many users. An AI agent that texts back within seconds can handle scheduling, order updates, and tier-one support without forcing someone to install an app. This article explains how SMS APIs fit into agent architecture and what to implement on your server.

## Outbound SMS: the send endpoint

Outbound messages usually start with a POST request. You pass a `from` number your project owns, a `to` number in E.164 format, and a `body` string. The API returns a message ID you store for tracking.

Agents rarely send static text only. Your flow is: user event or cron triggers agent reasoning, the model drafts a reply, you truncate to SMS length limits (160 GSM characters per segment, longer messages split into multiple parts), then you call the send endpoint. Keep templates for regulated content such as opt-out language where required.

## Inbound SMS: webhooks to your agent

When someone texts your agent number, the provider POSTs a webhook to your configured URL. Typical fields include sender, recipient, body text, a message ID, and a conversation or thread key. Your handler should:

1. Validate the signature header.
2. Normalize phone numbers to E.164.
3. Load conversation history from your database.
4. Invoke the agent with the new user turn.
5. Send the model’s reply via the outbound API.

Return HTTP 200 quickly even if the agent runs asynchronously. Long model calls should not block the webhook thread. Queue the work and send the SMS when inference completes.

## Threading and memory

Users expect continuity. Map each pair of (your_number, their_number) to a thread ID. Append inbound and outbound bodies with timestamps. Pass the last N messages into your prompt or use a summarization step for long threads.

Multi-agent products should scope threads per tenant. A mistake here leaks one customer’s chat into another’s context. Enforce tenant ID in every query.

## Delivery receipts and failures

Carriers report queued, sent, delivered, or failed states on separate callbacks. Use them to retry transient failures and to stop messaging invalid numbers. Agents that promise “I’ll text you the link” should confirm delivery before closing a ticket.

Hard bounces often mean the user changed numbers or blocked your sender. Surface that to your CRM instead of letting the model retry forever.

## Rate limits and throughput

SMS is not infinite bandwidth. Campaigns need per-second caps and quiet hours. Conversational agents need concurrency limits so one viral post does not exhaust your account. Architect a small outbound queue with backoff.

US business texts from local numbers must be registered first. See [A2P 10DLC registration for AI agents](https://numberforagents.com/guides/a2p-10dlc-registration-for-ai-agents).

Separate transactional traffic (receipts, 2FA you own end-to-end) from marketing blasts if your provider assigns different reputation pools. Numbers for Agents is aimed at conversational agent traffic, not bulk verification bypass.

## Design patterns that work

**Human handoff.** When confidence is low, reply with a short message and create an internal task. Include a link or ask the user to reply CALL for a voice handoff if you also run [voice plumbing](https://numberforagents.com/guides/how-ai-voice-agents-receive-phone-calls).

**Structured actions.** Ask users to reply with digits for choices. Models parse natural language, but explicit options reduce errors on slow connections.

**Opt-outs in code.** Check every inbound message for STOP and the other opt-out words before it reaches the model. See the [appointment reminder agent](https://numberforagents.com/use-cases/appointment-reminder-sms-agent) for an example.

**Quiet hours.** Store the user’s timezone. Defer non-urgent outbound texts to morning local time.

## Security basics

Never trust inbound body text as instructions to your agent without scoping tools. A stranger texting “ignore previous instructions” should not delete data. Use tool allowlists and separate system prompts from user content.

Rotate API keys. Restrict send permissions to backend services, not mobile clients. Log redacted payloads for audit.

## How this maps to Numbers for Agents

Our API will expose message send, inbound webhooks, and per-number configuration consistent with the voice side of the product. You provision a line once, then use the same number for SMS and calls if you enable both capabilities. Start with [how to give your AI agent a phone number](https://numberforagents.com/guides/how-to-give-your-ai-agent-a-phone-number), then [join the waitlist](https://numberforagents.com/#waitlist) for beta access.
