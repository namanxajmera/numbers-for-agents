---
title: A2P 10DLC Registration for AI Agents: 2026 Guide
description: Register an AI agent's SMS number for A2P 10DLC: brand types, use cases, 2026 fees, approval time, toll-free vs 10DLC, and why campaigns get rejected.
h1: A2P 10DLC registration for AI agents
published: 2026-10-08
updated: 2026-10-08
order: 7
related: /guides/ai-agent-sms-api-explained, /use-cases/appointment-reminder-sms-agent, /use-cases/phone-numbers-for-ai-agent-platforms
---

If your AI agent sends texts from a US local number, the number must be registered for A2P 10DLC. US carriers block unregistered business texts. This guide explains what to register, what it costs, how long it takes, and how to get approved on the first try. Facts are current as of October 8, 2026. This is not legal advice.

> **Short answer:** register a **brand** (your business) and a **campaign** (what the agent texts about) with The Campaign Registry through your SMS provider. Expect $4.50 to $46 one time for the brand, $15 per campaign review, and $1.50 to $10 per month per campaign. Campaign review takes about 5 to 10 business days. Most rejections come from a weak opt-in description, a missing privacy policy, or sample messages that do not match the use case.

## What A2P 10DLC is

A2P means application-to-person: messages sent by software, not typed by a person on a phone. 10DLC means a standard 10-digit long code, the normal US local number. Carriers treat every message from a CPaaS platform such as Twilio or Telnyx as A2P. An AI agent's texts are always A2P.

Registration has two layers:

- **Brand:** the business that sends the messages, identified by its legal name and EIN.
- **Campaign:** the use case, with sample messages and a description of how people opt in. Numbers are linked to a campaign. Throughput is set per campaign.

## Unregistered texts are blocked

Registration is not optional. Twilio has blocked all unregistered 10DLC messages to the US since September 1, 2023. Blocked messages fail with error 30034 and are still billed. Telnyx blocks unregistered 10DLC traffic since February 3, 2025. Messages from a campaign that is still pending review are blocked too. Do not launch an SMS agent before its campaign is approved.

## Pick a brand type

| | Sole Proprietor | Low Volume Standard | Standard |
|---|---|---|---|
| Who | No EIN | Has an EIN, low volume | Has an EIN |
| Campaigns and numbers | 1 campaign, 1 number | Mixed campaign, several numbers | Many campaigns |
| Daily limit (all US carriers) | about 3,000 segments | about 6,000 segments | Set by trust score |
| Daily limit to T-Mobile | 1,000 | 2,000 | Up to 200,000 |
| Throughput | 1 message/second | 3.75 messages/second | Up to 225 messages/second |
| Brand fee (one time) | $4.50 | $4.50 | $46, includes vetting |

Source: [Twilio brand comparison](https://support.twilio.com/hc/en-us/articles/4407882914971) and [Twilio 10DLC fees](https://support.twilio.com/hc/en-us/articles/1260803965530).

A business with an EIN cannot register as a Sole Proprietor. Most AI agent products should register as Low Volume Standard to start, and move to Standard when volume grows past about 6,000 segments a day.

Public for-profit companies must also pass Authentication+ (Auth+), an email check against the company's domain. It costs $12.50 per attempt. Since January 30, 2026, public companies that have not passed it cannot register new campaigns.

## Pick a campaign use case

Choose the use case that matches what the agent actually texts. Common choices for agents:

- **Customer Care:** an agent that answers support questions and account issues.
- **Account Notifications:** status updates, such as order or ticket changes.
- **Delivery Notifications:** shipping and delivery updates.
- **Mixed or Low Volume Mixed:** an agent that does several of these. Low Volume Mixed has the lowest fee and the lowest throughput.
- **Marketing:** promotions. It needs stricter consent. Keep it in a separate campaign.

An agent that books appointments and answers questions is usually Mixed or Customer Care. If the use case on the form does not match the sample messages, the campaign gets rejected.

## What it costs

These are The Campaign Registry fees that Twilio and Telnyx pass through at cost, as of October 2026:

| Fee | Amount |
|---|---|
| Brand, Sole Proprietor or Low Volume Standard | $4.50 one time |
| Brand, Standard (includes secondary vetting) | $46 one time |
| Authentication+ (public companies) | $12.50 per attempt |
| Campaign vetting | $15 per submission, not refunded if rejected |
| Campaign, Low Volume Mixed | $1.50 per month |
| Campaign, Sole Proprietor | $2 per month |
| Campaign, Standard use cases | $10 per month |

Telnyx bills the first 3 months of the campaign fee up front. Other providers can charge more. Bandwidth lists higher figures, for example. Carriers also add a per-message surcharge on registered traffic, about $0.0035 to $0.005 per outbound SMS segment depending on the carrier.

Because the $15 vetting fee is charged on every submission, a rejected campaign costs you money and a week. Get it right the first time.

## How long it takes

- **Brand registration:** minutes, sometimes up to 24 hours.
- **Secondary vetting (Standard brands):** up to 7 days.
- **Campaign review:** about 5 to 10 business days. Longer when the registry is busy.

Plan for two weeks from start to first approved text. Retell, for example, tells customers to expect 2 to 3 weeks.

## How to get approved the first time

Carriers reject campaigns for the same reasons again and again. Twilio's [rejection list](https://support.twilio.com/hc/en-us/articles/15778026827291) groups them like this:

1. **Opt-in is unclear.** Describe exactly where and how a person agrees to texts. Link to a screenshot or a public page with the form. The checkbox must not be pre-checked. Texting consent must not be required to use the service.
2. **Consent language is missing.** The opt-in form must name your brand, say what messages the person will get, say how often, say "Msg & data rates may apply", and explain STOP and HELP.
3. **No privacy policy.** Link a privacy policy from the opt-in flow. It must say you do not share mobile opt-in data with third parties for marketing.
4. **No terms.** Link SMS terms from the opt-in flow.
5. **Sample messages do not match.** Write 2 to 5 real samples. Include your brand name and "Reply STOP to opt out" in at least one. Do not use public URL shorteners. Use HTTPS links.
6. **Website problems.** The website must be live, public, and show who the business is. A login page alone fails.
7. **Brand mismatch.** The brand name must match the website and the EIN record.

For an AI agent, add one line to the campaign description that says the replies are generated by an automated assistant on behalf of your business. A clear description of who sends the messages avoids follow-up questions from reviewers.

## Toll-free: the faster alternative

A toll-free number skips The Campaign Registry. It uses its own verification instead.

- **Review time:** about 3 to 5 business days.
- **No brand or campaign fees.** You pay the number fee and message fees.
- **Default throughput:** 3 messages per second after verification.
- **Requirements:** a registered business with an EIN (since January 1, 2026), and separate privacy policy and terms URLs (since September 15, 2026).

Unverified toll-free numbers are blocked. Toll-free numbers work well for support and notification agents. Choose a local 10DLC number when a local area code matters to your users, or when you need one number per location.

## AI agent rules on top of 10DLC

Registration does not replace consent law. Two rules matter most for agents:

- **Opt-outs.** A reply such as STOP, QUIT, END, REVOKE, OPT OUT, CANCEL, or UNSUBSCRIBE must stop messages. You must honor it within 10 business days, and in practice your agent should stop at once. An FCC order adopted September 30, 2026 (FCC 26-67) will let senders name one exclusive opt-out method, such as replying STOP, once it takes effect. It takes effect 30 days after Federal Register publication.
- **Never let the model ignore STOP.** Handle opt-out keywords in code before the message reaches the model. A model can misread "stop texting me" as a question.

## FAQ

### Does an AI agent need A2P 10DLC registration?

Yes, if it sends texts to US numbers from a US local number. Carriers treat all software-sent texts as A2P, and unregistered traffic is blocked.

### How much does 10DLC registration cost?

For a typical small agent product: $4.50 for the brand, $15 for campaign vetting, and $1.50 to $10 per month for the campaign. A Standard brand costs $46 one time. Your provider may add its own fees.

### How long does 10DLC approval take?

Brand registration takes minutes to a day. Campaign review takes about 5 to 10 business days. Plan for two weeks.

### Is toll-free better than 10DLC for an AI agent?

Toll-free is faster to verify and has no registry fees, so it suits support and notification agents. 10DLC suits agents that need local area codes or one number per location.

### Why was my 10DLC campaign rejected?

The most common causes are an unclear opt-in flow, missing consent language, no privacy policy or terms link, and sample messages that do not match the use case. Your provider returns an error code that names the reason.
