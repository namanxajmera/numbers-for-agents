# How to connect a phone number to Retell AI

> Connect a phone number to a Retell AI agent: buy a Retell number, or bring your own Twilio or Telnyx number over SIP trunking. Plus SMS setup and costs.
>
> Source: https://numberforagents.com/guides/connect-phone-number-to-retell-ai · Updated 2026-10-08 · Numbers for Agents

Retell gives you two ways to put a phone number on an agent. You can buy a number inside Retell, or you can connect a number you already own through SIP trunking. This guide covers both, plus SMS. Steps follow Retell's docs as of October 8, 2026.

> **Short answer:** buy a Retell number ($2 per month, US and Canada) to start fast. Connect your own Twilio or Telnyx number over SIP to keep control of the number and pay no Retell telephony fee. In both cases, a number only takes calls after you bind an agent to it.

## Option 1: Buy a number in Retell

1. In the Retell dashboard, open **Phone Numbers** and click **+**.
2. Optionally choose an area code.
3. Bind an inbound agent, an outbound agent, or both.

A payment method is required. Retell sells US and Canada numbers only. Local numbers cost $2 per month. US toll-free numbers cost $5 per month. You can also buy through the API with `POST https://api.retellai.com/create-phone-number` and an `area_code`.

## Option 2: Connect your own number with SIP trunking

Retell calls this "custom telephony". Your carrier keeps the number. Calls flow between your carrier and Retell over SIP. Retell does not charge for the telephony on these calls. Your carrier bills the minutes.

Key facts for any carrier:

- Retell's SIP server is `sip:sip.retellai.com`. Point inbound (origination) calls there.
- Retell has no termination URI of its own. You give Retell your carrier's termination URI for outbound calls.
- Supported transports: TCP (recommended), UDP, TLS. Codecs: PCMU, PCMA, G.722.
- The old endpoint `sip:5t4n6j0wnrl.sip.livekit.cloud` was retired on September 30, 2026. Update any trunk that still uses it.

### Twilio Elastic SIP to Retell

1. In Twilio, create an **Elastic SIP Trunk**.
2. Under **Termination**, note the termination SIP URI. Pick a localized URI near your region. Allow Retell's signaling IPs (`18.98.16.120/30`) or create a credential list with a username and password.
3. Under **Origination**, add the URI `sip:sip.retellai.com`.
4. Buy a number in Twilio, or move an existing number onto the trunk.
5. In Retell, open **Phone Numbers**, click **+**, then **Connect to your number via SIP trunking**. Enter the termination URI and the credentials if you made them. Click **Test SIP Connection**, then **Save**.
6. Bind an agent to the number.
7. For international calls, enable the countries under Twilio's **Voice Geographic Permissions > Elastic SIP Trunking**.

### Telnyx to Retell

1. In Telnyx, create a SIP trunk of type **FQDN**. Add `sip.retellai.com` with DNS record type **SRV**.
2. Set outbound authentication to **credentials** (username and password).
3. In inbound settings, set the number format to `+E.164`, enable codecs G722, G711U, and G711A, and choose TCP.
4. Create an **Outbound Voice Profile** and select it in the trunk's outbound settings.
5. Move your numbers onto the trunk.
6. In Retell, import the number with Telnyx's SIP address (for example `sip.telnyx.com`) as the termination URI. Add the username and password, and the header `X-Telnyx-Username: <username>` that Telnyx requires on outbound calls.

### Import with the API

```bash
curl -X POST https://api.retellai.com/import-phone-number \
  -H "Authorization: Bearer $RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+14155550123",
    "termination_uri": "your-trunk.pstn.twilio.com",
    "sip_trunk_auth_username": "YOUR_SIP_USERNAME",
    "sip_trunk_auth_password": "YOUR_SIP_PASSWORD",
    "nickname": "Support line"
  }'
```

Then bind agents in the dashboard or through the update phone number API. Retell also has guides for Vonage, Five9, Genesys, Avaya, and Amazon Connect.

## Bind agents and route calls

A Retell number "can receive and make calls only after you bind an agent to it". You can bind different agents for inbound and outbound calls. Leave one direction unset to disable it.

To pick the agent per call, set an `inbound_webhook_url` on the number. Retell calls your server for each inbound call, and you return the agent and any dynamic variables, or reject the call. Platforms that serve many customers use this to route by caller or by number.

When all concurrent lines are busy, Retell holds the call for about 40 seconds. Then it transfers to the number's fallback number, or ends the call.

## Add SMS

SMS on Retell works on Retell-bought Twilio numbers, and on your own numbers that passed A2P 10DLC registration. Telnyx numbers do not support SMS on Retell yet. SMS is US only and excludes toll-free numbers.

For a Retell-bought number, Retell runs the registration with you:

1. Create a business profile (free).
2. Register a brand: $4 one time for low volume (under 6,000 segments per day) or $45 for standard.
3. Register a campaign: $15 one time, non-refundable.
4. After approval, pay $20 per month per number plus $0.01 per SMS.

Approval takes about 2 to 3 weeks. Read the [A2P 10DLC guide](https://numberforagents.com/guides/a2p-10dlc-registration-for-ai-agents) so your campaign passes the first time.

## What it costs

Retell's voice infrastructure fee is $0.055 per minute. LLM and voice costs come on top. Retell's own example totals $0.11 per minute. Retell-bought US numbers on Twilio carry a telephony rate of $0.015 per minute. SIP trunking has no Retell telephony charge, so you pay your carrier instead. Pay-as-you-go includes 20 concurrent calls. Extra lines cost $8 per month. [Retell pricing](https://www.retellai.com/pricing).

## FAQ

### Can I use my own phone number with Retell AI?

Yes. Connect it over SIP trunking from Twilio, Telnyx, Vonage, or a contact-center platform. If your carrier does not support SIP trunking, port the number to one that does.

### How much does a Retell phone number cost?

$2 per month for a US or Canada local number, and $5 per month for a US toll-free number. Numbers you connect over SIP have no Retell number fee.

### Does Retell support SMS?

Yes, in the US, on Retell Twilio numbers or your own A2P-registered numbers. Telnyx numbers are not supported for SMS yet. Retell adds $20 per month per number plus $0.01 per message.

### Why does my Retell number not answer calls?

Check that an inbound agent is bound to the number. Without a bound agent, the number does not take calls.
