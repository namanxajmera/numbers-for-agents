---
title: Vapi Phone Numbers: Free vs Twilio vs Telnyx vs SIP
description: Free Vapi numbers are inbound only and US only. Compare Twilio import, Telnyx import, and BYO SIP trunk on Vapi for outbound calls, SMS, and cost.
h1: Vapi phone numbers: free number vs Twilio vs Telnyx vs SIP
published: 2026-10-08
updated: 2026-10-08
order: 3
related: /guides/connect-phone-number-to-vapi, /compare/twilio-vs-telnyx-for-ai-voice-agents, /compare/best-phone-number-apis-for-ai-agents
---

Vapi gives you four ways to put a phone number on an assistant: a free Vapi number, an imported Twilio number, an imported Telnyx number, or your own SIP trunk. They are not equal. The free number cannot make outbound calls or send SMS. Only an imported Twilio number supports SMS today.

Facts on this page come from Vapi's docs and pricing page, checked on October 8, 2026.

> **Short answer:** use the free Vapi number to test inbound calls. Import a Twilio number if you need outbound calls and SMS. Import a Telnyx number if you need outbound calls at a lower per-minute cost and do not need SMS through Vapi. Use a SIP trunk if your carrier is not Twilio or Telnyx, or you need custom routing.

## Comparison table

| | Free Vapi number | Twilio import | Telnyx import | BYO SIP trunk |
|---|---|---|---|---|
| Inbound calls | Yes | Yes | Yes | Yes |
| Outbound calls | No | Yes | Yes, after an Outbound Voice Profile step | Yes |
| SMS through Vapi | No | Yes, US to US, 10DLC-approved number | No | No |
| Countries | US area codes only | Any Twilio number | Any Telnyx number | Any carrier |
| Port out later | No | Yes, from Twilio | Yes, from Telnyx | Yes, from your carrier |
| Who bills the minutes | Vapi credits | Twilio | Telnyx | Your carrier |
| Setup time | Minutes | Minutes | Minutes, plus portal setup | An hour or more |

Sources: [free telephony](https://docs.vapi.ai/free-telephony), [outbound calling](https://docs.vapi.ai/calls/outbound-calling), [import Twilio](https://docs.vapi.ai/phone-numbers/import-twilio), [Telnyx](https://docs.vapi.ai/telnyx), [inbound SMS](https://docs.vapi.ai/phone-numbers/inbound-sms), [SIP trunk](https://docs.vapi.ai/advanced/sip/sip-trunk).

## Free Vapi numbers

Every account gets one free Vapi number. Paid Success Packages include more: 5 on Core, 10 on Pro. You create it in the dashboard under **Phone Numbers > Create Phone Number > Free Vapi Number** and pick a US area code.

The limits matter:

- **Inbound only.** Vapi's docs say: "Free Vapi numbers are inbound only." You cannot place outbound calls or run Outbound Campaigns.
- **US only.** Free numbers use US area codes. For other countries, import a number.
- **No porting.** The number sits on Vapi's carrier accounts, so you cannot move it to another provider later.
- **Calls still cost credits.** The number is free. The minutes are billed at Vapi rates.

Older forum posts describe "10 outbound calls per day" on free numbers. That limit no longer applies, because the current docs remove outbound calling from free numbers entirely.

## Import a Twilio number

A Twilio number is the most complete option on Vapi. It supports inbound and outbound calls, and it is the only number type that supports SMS. You need the number, your Twilio Account SID, and your Auth Token. Step-by-step instructions are in [connect a phone number to Vapi](/guides/connect-phone-number-to-vapi).

SMS has conditions. Inbound SMS works only for US-to-US messages on a Twilio number with SMS enabled. The number must be 10DLC-approved. Vapi's SMS chat only replies to customers. The assistant cannot send the first message. Replies also need a saved payment method on your Vapi account. See the [A2P 10DLC guide](/guides/a2p-10dlc-registration-for-ai-agents) for the registration step.

## Import a Telnyx number

Telnyx numbers cost less per minute than Twilio at list price. Import needs the number and a Telnyx API key. Outbound calls need one more step in the Telnyx Portal: add the Vapi connection to an Outbound Voice Profile. Vapi's docs warn that outbound "will not work properly" without it.

Vapi documents one known issue. On some calls outside North America, Telnyx sends A-law audio (PCMA) while the integration expects µ-law (PCMU). That causes garbled audio. If you hit it, use a SIP trunk instead.

## Bring your own SIP trunk

A SIP trunk works with any carrier that supports SIP. You create a `byo-sip-trunk` credential with your carrier's gateway and auth, then register the number with `provider: "byo-phone-number"`. Inbound calls route to `{phoneNumber}@{credential_id}.sip.vapi.ai`. Vapi has guides for Twilio, Telnyx, Plivo, DIDWW, and others.

SIP is the most flexible option and the most work. Choose it when your carrier is not Twilio or Telnyx, when you already run a trunk, or when you want one trunk for several voice platforms.

## What it costs

Vapi charges a $0.05 per minute hosting fee, plus model costs at cost. Calls on imported numbers are billed again by the carrier. As a reference, Twilio lists US local voice at $0.0085 per minute inbound and $0.014 outbound. Telnyx lists about $0.005 inbound and $0.007 outbound. Numbers cost $1.15 per month on Twilio and $1.00 on Telnyx. See [Twilio vs Telnyx](/compare/twilio-vs-telnyx-for-ai-voice-agents) for the full table.

Concurrency is per organization and shared between inbound and outbound calls. The pay-as-you-go plan includes 4 concurrent calls. Core includes 10. Extra lines cost $10 per month each. [Vapi pricing](https://vapi.ai/pricing).

## Which to choose

- **Testing an inbound assistant:** free Vapi number.
- **Outbound calls or SMS:** Twilio import.
- **Outbound calls at lower cost, no SMS needed:** Telnyx import.
- **Any other carrier, or numbers you share across platforms:** SIP trunk.
- **Numbers for many customers:** import numbers through the API, not the dashboard. See [one number per customer](/use-cases/phone-numbers-for-ai-agent-platforms).

## FAQ

### Can a free Vapi number make outbound calls?

No. Vapi's current docs say free Vapi numbers are inbound only. Import a Twilio or Telnyx number, or connect a SIP trunk, to place outbound calls.

### Does Vapi support SMS?

Yes, on imported Twilio numbers only, for US-to-US messages. The number must be 10DLC-approved. The customer must send the first message.

### How many free numbers does Vapi give you?

One on the pay-as-you-go plan. Core includes 5 and Pro includes 10.

### Can I import a number from any carrier into Vapi?

Twilio and Telnyx have native import. The API also accepts `provider: "vonage"`. For any other carrier, use a BYO SIP trunk.
