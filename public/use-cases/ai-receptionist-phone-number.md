# AI receptionist phone number: how to set one up

> Give an AI receptionist a phone number: forwarding vs new number vs porting, call flow, human transfer, after-hours, SMS follow-up, and US AI voice rules.
>
> Source: https://numberforagents.com/use-cases/ai-receptionist-phone-number · Updated 2026-10-08 · Numbers for Agents

An AI receptionist answers a business's phone calls: it greets callers, answers common questions, books appointments, takes messages, and transfers to a person when needed. The phone number is the part callers see. This page covers how to connect a number to an AI receptionist, the call flow to build, and the US rules that apply to AI voices.

> **Short answer:** keep the business's existing number and forward calls to a new number that your AI receptionist answers. Port the number later if the setup works. Inbound calls answered by AI need no special consent. Outbound calls with an AI voice need the called person's prior express consent.

## Three ways to connect the business number

| Option | How it works | Good for | Watch out for |
|---|---|---|---|
| **Call forwarding** | The business's carrier forwards calls to your agent's number. | Pilots, and businesses that want to keep their phone provider. | The caller ID your agent sees can be the forwarding number, depending on the carrier. Test it. |
| **New number** | The business publishes a new number that the agent answers. | New locations, campaigns, after-hours lines. | Customers must learn the new number. |
| **Port the number** | The business moves its number to your carrier. | Full production setups. | Porting takes days. Plan the cutover. |

Most AI receptionist products start with forwarding. Forwarding can be conditional: forward only when the front desk does not answer, when the line is busy, or after hours. That lets the business try the AI on overflow calls first.

## The call flow

A good AI receptionist call flow has five parts:

1. **Answer fast.** Pick up within one or two rings. Greet with the business name.
2. **Find the intent.** Booking, a question, a message, or a request for a person.
3. **Act with tools.** Check the calendar, book the slot, look up hours, or create a ticket. Confirm details back to the caller.
4. **Transfer when needed.** Hand the call to a person for anything the agent cannot handle, and for any caller who asks for a person. Send the person a summary.
5. **Follow up by text.** Send a booking confirmation or a summary by SMS after the call, if the caller agreed.

On the telecom side, an inbound call reaches your server as a webhook, and the audio flows to your agent over a WebSocket stream or SIP. See [how AI voice agents receive phone calls](https://numberforagents.com/guides/how-ai-voice-agents-receive-phone-calls).

## Human transfer

Transfer is where many AI receptionists fail. Build it in from day one.

- **Warm transfer:** the agent calls the person first, gives a short summary, then connects the caller.
- **Cold transfer:** the agent connects the caller directly. Faster, but the person starts with no context.
- **Fallback:** if nobody answers, take a message and promise a callback with a time.

Voice platforms such as Vapi and Retell include transfer tools. If you run your own stack, your telephony provider must support transferring or bridging a live call.

## After-hours and overflow

Most value comes from calls the business would miss. Set the routing rules with the business:

- **Business hours:** front desk answers. AI takes calls that ring out or arrive while the line is busy.
- **After hours:** AI answers every call, books appointments, and takes messages.
- **Emergencies:** for clinics and home services, give the agent a clear rule to tell callers how to reach emergency help.

## SMS follow-up

A text after the call confirms what the agent did. To send it from the same number, the number needs SMS, and in the US the number needs [A2P 10DLC registration](https://numberforagents.com/guides/a2p-10dlc-registration-for-ai-agents). Ask the caller during the call if they want a text, and record the answer.

## US rules for AI voice

These facts are current as of October 8, 2026. This is not legal advice.

- **Inbound calls:** the FCC's AI voice ruling covers outbound calls. An AI answering calls that people place to the business is not restricted by it.
- **Outbound calls:** in February 2024 the FCC ruled (FCC 24-17) that AI-generated voices are "artificial" voices under the TCPA. Outbound calls with an AI voice need the called person's prior express consent, unless an exemption applies. Marketing calls need prior express written consent.
- **Identification:** artificial-voice calls must state the business's identity at the start, and give a phone number during or after the call.
- **AI disclosure at the start of a call:** the FCC has proposed it (FCC 24-84) but has not adopted it as a rule. State laws can add duties, so check the states you operate in. Disclosing anyway is good practice, and many callers prefer to know.
- **Recording:** some states require every party's consent to record a call. If you record or transcribe, say so in the greeting.

## Caller ID and answer rates

For callbacks, people answer more often when the caller ID looks trustworthy.

- **STIR/SHAKEN:** carriers sign outbound calls with an attestation level. "A" means the carrier knows the customer and that the customer may use the number. Numbers bought from the carrier you call through usually get A. Attestation alone does not prevent a "Spam Likely" label.
- **CNAM:** register a caller name (up to 15 characters) for the number. Twilio and Telnyx both offer free registration. Many mobile carriers show it only if the subscriber turned the feature on.

## How Numbers for Agents fits

Numbers for Agents is building the phone layer for products like this: numbers, call webhooks, WebSocket audio and SIP into your voice stack, and SMS on the same number. It is in private beta. Join the waitlist below if you build AI receptionists.

## FAQ

### Can an AI receptionist use my existing business number?

Yes. Forward calls from your current carrier to the AI receptionist's number, either all the time or only when the front desk does not answer. You can port the number later.

### Do I need consent for an AI to answer phone calls?

The FCC's 2024 AI voice ruling applies to outbound calls. An AI answering inbound calls is not restricted by it. Call recording laws still apply if you record.

### Does an AI receptionist have to say it is an AI?

There is no final federal rule that requires it as of October 2026. The FCC has proposed one, and state laws can add duties. Disclosing it is the safe default.

### What happens when the AI cannot answer a question?

It should transfer the call to a person, or take a message and promise a callback. Build this path before launch.
