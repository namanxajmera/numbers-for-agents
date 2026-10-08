---
title: Appointment Reminder SMS Agent: Confirm and Reschedule
description: Build an AI agent that texts appointment reminders and handles confirm, cancel, and reschedule replies. Consent rules, healthcare limits, 10DLC, and STOP.
h1: Appointment reminder SMS agent
published: 2026-10-08
updated: 2026-10-08
order: 2
related: /guides/a2p-10dlc-registration-for-ai-agents, /guides/ai-agent-sms-api-explained, /use-cases/ai-receptionist-phone-number
---

A reminder text that only says "You have an appointment tomorrow at 3pm" is a one-way broadcast. An appointment reminder **agent** reads the reply. When the person writes "can we do Thursday instead?", the agent checks the calendar, offers times, and moves the booking. This page covers the message flow, the phone number setup, and the US rules for reminder texts.

> **Short answer:** use one registered number per business for reminders and replies. Collect consent when the appointment is booked. Send the reminder 24 to 48 hours before, let the agent handle confirm, cancel, and reschedule replies, and handle STOP in code before the model sees the message. Healthcare reminders have a consent exemption with strict limits.

## The message flow

1. **Booking.** The person books and agrees to get texts about the appointment. Store the consent with a timestamp and the wording they saw.
2. **Reminder.** Send 24 to 48 hours before. Include the business name, date, time, and how to reply. Example: "Bright Dental: reminder of your appointment Thu Oct 15 at 3:00pm. Reply C to confirm, R to reschedule. Reply STOP to opt out."
3. **Reply handling.** The agent reads the reply. "C", "yes", and "see you then" all mean confirm. "R" or "can I come Friday" means reschedule.
4. **Reschedule.** The agent checks the calendar, offers two or three slots, and books the chosen one. It sends a confirmation text with the new time.
5. **Escalation.** Questions the agent cannot answer go to staff, with the thread attached.

Accept short codes such as C and R, and also natural language. Short codes are reliable. Natural language is what people actually send.

## Handle STOP before the model

Opt-out handling must never depend on the model. Check every inbound message in code first:

```js
const OPT_OUT = ["stop", "quit", "end", "revoke", "opt out", "cancel", "unsubscribe"];

function isOptOut(body) {
  const text = body.trim().toLowerCase().replace(/[^a-z ]/g, "");
  return OPT_OUT.includes(text);
}
```

If the message is an opt-out, mark the number as opted out, send at most one confirmation text with no marketing, and stop. Under current FCC rules these seven words are always valid opt-outs, and other wording counts too if a reasonable person would read it as an opt-out. You must honor an opt-out within 10 business days. Your agent should stop at once.

The word "cancel" is a problem for reminder agents, because a person may mean "cancel my appointment". Treat a bare "CANCEL" as an opt-out, as the rules require. Then let the agent ask in its confirmation whether the person also wants the appointment cancelled, or tell them how to cancel it.

## Consent rules for reminder texts

These facts are current as of October 8, 2026. This is not legal advice.

- **General reminders** (salons, home services, car service, professional services) are informational. Automated texts to mobile numbers need the person's prior express consent. Written consent is required only for marketing. Collect consent at booking and keep the record.
- **Do not mix in marketing.** A promotion inside a reminder makes it a marketing message, which needs prior express written consent. Keep promotions in a separate program.
- **Opt-outs by category.** An FCC order adopted September 30, 2026 (FCC 26-67) will let a STOP reply to an informational message cover only that category, and let senders name one exclusive opt-out method such as replying STOP. It takes effect 30 days after publication in the Federal Register. Until then, the current rules apply.

## Healthcare reminders: the exemption and its limits

The FCC exempts some healthcare messages to mobile numbers from the consent requirement (47 CFR 64.1200(a)(9)(iv)). The limits are strict. The message must:

- Go only to the mobile number the patient gave the provider.
- Name the provider and give contact information.
- Be for an allowed purpose, such as appointment confirmations and reminders, pre-operative instructions, lab results, or prescription notices.
- Contain no marketing and no billing or debt content.
- Be 160 characters or less for a text.
- Be sent at most once a day and three times a week per patient.
- Offer an easy opt-out, such as replying STOP, and honor it immediately.
- Comply with HIPAA privacy rules.

A two-way reschedule conversation goes beyond a single reminder. The safer path is to collect consent at booking anyway. Also keep health details out of texts. "Your appointment at Bright Dental" is fine. The reason for the visit is not.

## Phone number setup

- **One number per business.** Patients and customers should see the same sender every time. For platforms with many businesses, see [one number per customer](/use-cases/phone-numbers-for-ai-agent-platforms).
- **10DLC or toll-free.** A local number needs [A2P 10DLC registration](/guides/a2p-10dlc-registration-for-ai-agents). Register as Customer Care, Account Notifications, or Mixed, with sample messages that show the reminder and a reschedule reply. A verified toll-free number is a faster alternative.
- **Voice on the same number.** People often call back the number that texted them. Enable voice and forward calls to the front desk, or to an [AI receptionist](/use-cases/ai-receptionist-phone-number).
- **Timing.** Send reminders at sensible local times. Store each person's time zone.

## How Numbers for Agents fits

Numbers for Agents is building an API for agent phone lines: numbers, two-way SMS webhooks, and voice on the same number. It is in private beta. Join the waitlist below if you build reminder or scheduling agents.

## FAQ

### Do I need consent to send appointment reminder texts?

Yes, in most cases. Automated texts to mobile numbers need prior express consent. Collect it at booking. Healthcare providers have a narrow exemption for reminders that meet strict conditions.

### How far in advance should an appointment reminder be sent?

24 to 48 hours before is common. Some businesses add a second reminder a few hours before. For healthcare reminders under the FCC exemption, the limit is one message per day and three per week.

### Can an AI agent reschedule appointments by text?

Yes. The agent reads the reply, checks the calendar through a tool, offers open slots, and books the one the person picks. Keep a human escalation path for anything unclear.

### What should a reminder text include?

The business name, the date and time, how to confirm or reschedule, and how to opt out. Keep health details and promotions out.
