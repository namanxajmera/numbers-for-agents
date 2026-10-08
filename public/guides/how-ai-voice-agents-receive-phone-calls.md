# How AI voice agents receive phone calls

> Understand inbound call flow for AI agents: webhooks, SIP, WebSocket media, latency, handoff to humans, and how to bring your own voice stack.
>
> Source: https://numberforagents.com/guides/how-ai-voice-agents-receive-phone-calls · Updated 2026-10-08 · Numbers for Agents

Voice is the hardest channel for agents because audio is real time. Callers tolerate only a short pause after they stop speaking. This guide walks through what happens when someone dials your agent’s number and how your code joins the call without buying a bundled voice platform.

## The call timeline

A typical inbound flow looks like this:

1. The public switched telephone network routes the call to your provider.
2. The provider hits your voice webhook with `call.started` (names vary by API).
3. Your server responds with how to handle audio: connect WebSocket, dial SIP, play a prompt, or reject.
4. Once media is up, your STT → model → TTS loop runs until hangup or transfer.
5. A final webhook reports duration, disposition, and recording URLs if enabled.

Each step must complete in hundreds of milliseconds where possible. Cold starts on serverless functions are a common failure mode. Warm pools or dedicated workers for voice webhooks pay off quickly.

## Webhooks vs media paths

Webhooks carry JSON metadata only. They do not include the caller’s voice. After you accept a call, you need a **media path**:

- **WebSocket streaming** — bidirectional audio frames encoded as PCM or Opus. Your agent service reads frames, runs VAD and STT, streams TTS back.
- **SIP** — you return a SIP URI or the provider bridges to your registered trunk. Useful if you already host FreeSWITCH, Asterisk, or a CPaaS that speaks SIP.

Some teams mix both: webhook for state, WebSocket for media. Others send SIP directly to [Retell](https://numberforagents.com/guides/connect-phone-number-to-retell-ai), [Vapi](https://numberforagents.com/guides/connect-phone-number-to-vapi), or a custom orchestrator. For carrier prices on both paths, see [Twilio vs Telnyx for AI voice agents](https://numberforagents.com/compare/twilio-vs-telnyx-for-ai-voice-agents). Numbers for Agents stays neutral — we deliver the call leg; you choose the brain.

## Answering logic your agent must implement

On `call.started`, decide:

- Should this caller reach the agent or a human queue?
- Is the number in business hours?
- Do you need a short disclosure (“This call may be recorded”)?

Return a machine-readable instruction object. Examples: `connect_media` with a WebSocket URL, `transfer` to a PSTN number, or `hangup` with a cause code. Keep responses idempotent; providers may retry the initial webhook.

## Latency budget

Users perceive delays over ~700 ms as awkward. Budget time across:

- Network round trip from carrier to your region.
- Speech-to-text partial results.
- Model inference (use streaming tokens).
- Text-to-speech first byte.

Start TTS on the first fluent phrase instead of waiting for the full completion. Barge-in (caller interrupts) requires cancelling in-flight TTS and clearing buffers — plan for it in your media handler.

## Outbound calls from the same number

Agents that both receive and place calls should present the same caller ID for trust. Outbound usually starts with an API request specifying `from`, `to`, and a URL that returns voice instructions when the callee answers. Symmetry simplifies compliance records: one number, one opt-in story.

For SMS on the same line, read [AI agent SMS API explained](https://numberforagents.com/guides/ai-agent-sms-api-explained) and provision capabilities together when you [give your agent a phone number](https://numberforagents.com/guides/how-to-give-your-ai-agent-a-phone-number).

## Recordings, voicemail, and logs

Product teams often want call logs even when the agent is automated. Store call ID, timestamps, outcome, and redacted transcripts. Voicemail can be a fallback when your agent errors: redirect to record-after-beep, then process the file with the same STT pipeline.

Tell callers when recording happens. Follow local laws for two-party consent regions.

## Human handoff

Design an explicit transfer path. When sentiment drops or the user asks for a person, your webhook should issue a transfer instruction with a target queue or phone number. The AI should stop speaking immediately after transfer starts to avoid talking over the human.

## Testing inbound voice

Use real handsets, not only softphones. Test weak cell signal, speakerphone, and accented speech. Automate regression with recorded WAV files injected into your media layer where possible.

Monitor webhook latency and media connect time as first-class metrics. Alert when P95 exceeds your budget.

## Where Numbers for Agents fits

We focus on number provisioning, inbound/outbound call events, SIP trunking, and WebSocket media bridges — not on selling you a default voice model. Bring Bland, Vapi, Retell, or your own stack. [Join the waitlist](https://numberforagents.com/#waitlist) to shape the beta API and lock in early per-number pricing.
