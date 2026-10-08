# How to connect a phone number to Vapi

> Put a phone number on a Vapi assistant: free Vapi number, Twilio import, Telnyx import, BYO SIP trunk, and the POST /phone-number API call.
>
> Source: https://numberforagents.com/guides/connect-phone-number-to-vapi · Updated 2026-10-08 · Numbers for Agents

This guide shows how to put a phone number on a Vapi assistant so people can call it, and so it can call out. It covers the dashboard steps and the API call for each number type. Steps follow Vapi's docs as of October 8, 2026.

If you have not picked a number type yet, read [Vapi phone numbers: free vs Twilio vs Telnyx vs SIP](https://numberforagents.com/compare/vapi-phone-numbers-free-vs-twilio-vs-telnyx) first. In short: free Vapi numbers are inbound only. Twilio imports support outbound calls and SMS. Telnyx imports support outbound calls.

## Before you start

- A Vapi account and an assistant you want to answer calls.
- For a Twilio import: a Twilio number, your Account SID, and your Auth Token.
- For a Telnyx import: a Telnyx number and a Telnyx API key.
- For a SIP trunk: your carrier's SIP server address, auth details, and a number (DID).

## Option 1: Free Vapi number (inbound only)

1. In the Vapi dashboard, open **Phone Numbers**.
2. Select **Create Phone Number**, then **Free Vapi Number**.
3. Enter a US area code. If the dashboard asks for a payment method, add one first.
4. Select **Create**. Activation can take a few minutes. Calls fail until it finishes.
5. Open the number. Under **Inbound Settings**, choose your assistant and select **Save**.

Call the number from your phone. Your assistant should answer.

## Option 2: Import a Twilio number

1. In the Twilio Console, buy a number if you do not have one.
2. In the Twilio Console dashboard, under **Account Info**, copy the **Account SID** and **Auth Token**.
3. In Vapi, open **Phone Numbers > Create Phone Number > Import Twilio**.
4. Enter the number with its country code, the Account SID, and the Auth Token. Turn on **SMS Enabled** if you want SMS. Select **Import from Twilio**.
5. Open the number and assign your assistant for inbound calls.

Vapi configures the Twilio webhooks for you. You do not need to set a voice URL in Twilio.

## Option 3: Import a Telnyx number

1. In Vapi, open **Phone Numbers > Create Phone Number > Import Telnyx**.
2. Enter the number with its country code and your Telnyx API key. Select **Import from Telnyx**.
3. Assign your assistant for inbound calls.
4. For outbound calls, open the Telnyx Portal and go to **Outbound Voice Profiles**. Create or select a profile, set the allowed destinations, then select **Add connections/apps to profile**. Choose the Vapi connection and select **Save**.

Skip step 4 and outbound calls will fail.

## Option 4: Bring your own SIP trunk (API)

Use this for any carrier with SIP. First create a credential that describes your carrier's gateway:

```bash
curl -X POST https://api.vapi.ai/credential \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "byo-sip-trunk",
    "name": "my-carrier",
    "gateways": [{ "ip": "sip.your-carrier.com", "inboundEnabled": false }],
    "outboundLeadingPlusEnabled": true,
    "outboundAuthenticationPlan": {
      "authUsername": "YOUR_SIP_USERNAME",
      "authPassword": "YOUR_SIP_PASSWORD"
    }
  }'
```

Save the credential `id`. Then register the number:

```bash
curl -X POST https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "byo-phone-number",
    "name": "Support line",
    "number": "15551234567",
    "numberE164CheckEnabled": false,
    "credentialId": "YOUR_CREDENTIAL_ID"
  }'
```

For inbound calls, configure your carrier to send calls to `sip:15551234567@YOUR_CREDENTIAL_ID.sip.vapi.ai`. Allow Vapi's US signaling IPs (`44.229.228.186/32` and `44.238.177.138/32`) and UDP ports 40000 to 60000 for media. See Vapi's [SIP trunk docs](https://docs.vapi.ai/advanced/sip/sip-trunk) for carrier-specific guides.

## Import a number with the API

The dashboard steps above have an API equivalent: `POST https://api.vapi.ai/phone-number`. The body changes with `provider`. A Twilio import:

```bash
curl -X POST https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "twilio",
    "number": "+14155550123",
    "twilioAccountSid": "ACxxxxxxxx",
    "twilioAuthToken": "YOUR_AUTH_TOKEN",
    "assistantId": "YOUR_ASSISTANT_ID",
    "smsEnabled": true
  }'
```

For Telnyx, use `"provider": "telnyx"` with `credentialId` (a Telnyx credential you add in the Vapi dashboard) and `number`.

If you leave `assistantId` unset, Vapi sends an `assistant-request` to your server URL on each inbound call. Your server then picks the assistant per call. This is how platforms route one Vapi organization to many customers.

## Make an outbound call

Outbound calls need a Twilio, Telnyx, or SIP number. Free Vapi numbers cannot call out.

```bash
curl -X POST https://api.vapi.ai/call/phone \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assistantId": "YOUR_ASSISTANT_ID",
    "phoneNumberId": "YOUR_PHONE_NUMBER_ID",
    "customer": { "number": "+14155559876" }
  }'
```

Calling people with an AI voice in the US requires their prior consent. Read the [AI receptionist page](https://numberforagents.com/use-cases/ai-receptionist-phone-number) for the rules that apply to voice agents.

## Troubleshooting

- **Calls to a new free number fail.** Activation can take a few minutes. Wait and retry.
- **Outbound calls on Telnyx fail.** Add the Vapi connection to a Telnyx Outbound Voice Profile.
- **Garbled audio on Telnyx international calls.** Telnyx can send A-law audio where Vapi expects µ-law. Switch to a SIP trunk.
- **SMS arrives but the assistant does not reply.** Vapi needs a saved payment method, and the number must be 10DLC-approved.
- **Calls are rejected under load.** Concurrency is shared across inbound and outbound calls in your organization. Buy more lines or spread calls out.

## FAQ

### How do I give my Vapi assistant a phone number?

Open **Phone Numbers** in the Vapi dashboard, create a free Vapi number or import one from Twilio or Telnyx, then select your assistant under **Inbound Settings**.

### Can I use my existing business number with Vapi?

Yes. If the number is on Twilio or Telnyx, import it. If it is on another carrier, connect it with a SIP trunk, or port it to Twilio or Telnyx first.

### Why can't my free Vapi number make outbound calls?

Free Vapi numbers are inbound only. Import a Twilio or Telnyx number to call out.

### Does Vapi send SMS?

Only through imported Twilio numbers, for US-to-US messages, after 10DLC approval.
