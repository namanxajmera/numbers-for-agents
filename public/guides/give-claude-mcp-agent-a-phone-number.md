# How to give Claude or any MCP agent a phone number

> Give Claude Code, Claude Desktop, or any MCP agent a real phone number. Telephony MCP servers compared, with install commands and safety rules.
>
> Source: https://numberforagents.com/guides/give-claude-mcp-agent-a-phone-number · Updated 2026-10-08 · Numbers for Agents

An MCP server turns a telephony API into tools an AI agent can call. With the right server installed, Claude Code or Claude Desktop can buy a number, send a text, or place a call from a chat. This guide compares the telephony MCP servers available today and shows how to install each one. Facts come from each vendor's docs, checked on October 8, 2026.

> **Short answer:** for an agent that buys its own number and sends SMS, use AgentPhone's MCP server or Telnyx's remote MCP server. For voice calls through an existing voice platform, use the Bland, Retell, or Vapi MCP server. Twilio's official MCP server only searches Twilio's docs today.

## What each server can do

| MCP server | Buy a number | Send SMS | Place a call | Auth |
|---|---|---|---|---|
| AgentPhone | Yes (`buy_number`) | Yes (`send_message`) | Yes (`make_call`) | OAuth or API key |
| Telnyx remote | Yes, through `invoke_api_endpoint` | Yes, same tool | Yes, same tool | Telnyx API key |
| Retell | Import and provision, through `invoke_api_endpoint` | No | Yes | Retell API key |
| Bland | Through REST passthrough tools | No dedicated tool | Yes (`create_call`) | API key or OAuth |
| Vapi | No (list only) | No | Yes (`create_call`) | Vapi API key |
| Twilio official | No | No | No (docs search only) | None |

**Generic tools.** Telnyx and Retell expose three tools: list endpoints, get an endpoint's schema, and invoke an endpoint. The agent can reach the whole API this way, but it must find the right endpoint first. Dedicated tools such as AgentPhone's `send_message` are easier for a model to use correctly.

## AgentPhone

AgentPhone's server has 28 tools, including `buy_number`, `send_message` (SMS or iMessage), `get_messages`, `make_call`, `attach_number`, and `set_webhook`. Numbers are US and Canada.

Claude Code:

```bash
claude mcp add --transport http agentphone https://mcp.agentphone.ai/mcp
```

This signs in through your browser. To use an API key instead, add `--header "Authorization: Bearer YOUR_API_KEY"`. In Claude Desktop, open **Settings > Connectors > Add custom connector** and paste the URL. Numbers cost $3 per month and SMS costs $0.02 per segment. [Docs](https://docs.agentphone.ai/mcp).

## Telnyx

Telnyx's remote server at `https://api.telnyx.com/v2/mcp` gives the agent the full Telnyx API: search numbers, buy them, send messages, and control calls. `invoke_api_endpoint` can change state and spend money, so scope your API key with care.

In Claude Desktop, add it as a custom connector under **Settings > Connectors**, then grant access in the Telnyx Portal. Telnyx also ships a local server:

```bash
claude mcp add telnyx_mcp_api --env TELNYX_API_KEY="YOUR_KEY" -- npx -y telnyx-mcp
```

The local package runs in "code mode": a docs search tool plus a tool that runs Telnyx SDK code in a sandbox. [Docs](https://developers.telnyx.com/docs/development/mcp/remote-mcp).

## Retell

```bash
claude mcp add --transport http retell https://mcp.retellai.com \
  --header "Authorization: Bearer $RETELL_API_KEY"
```

The server can import, provision, and list phone numbers and create calls. Use it when your voice agent already runs on Retell. [Docs](https://docs.retellai.com/get-started/mcp-server).

## Bland

```bash
claude mcp add --transport http bland https://api.bland.ai/v1/mcp \
  --header "Authorization: Bearer $BLAND_API_KEY"
```

To sign in without a key, add the server without the header, then run `claude mcp login bland`. Bland marks `create_call` as destructive. It also has `wait_for_call` and `get_call_log`, so an agent can place a call and read the result. [Docs](https://docs.bland.ai/integrations/mcp/clients/claude-code).

Bland also sells an Agent Phone Plan that an agent can sign up for itself: one US number with calls and texts for $29.99 per month, capped at 50 calls and 100 texts per day.

## Vapi

Vapi's hosted server is at `https://mcp.vapi.ai/mcp` with a Bearer Vapi API key. It can create assistants and calls and list phone numbers. It cannot buy or import numbers and has no SMS tool. Get a number in the dashboard first. See [connect a phone number to Vapi](https://numberforagents.com/guides/connect-phone-number-to-vapi). [Docs](https://docs.vapi.ai/sdk/mcp-server).

## Twilio

Twilio's official MCP server (public beta) is read-only. It searches Twilio's documentation and does not execute API calls. It cannot send SMS, make calls, or buy numbers.

```bash
claude mcp add --transport http twilio-docs https://mcp.twilio.com/docs
```

Twilio's older `@twilio-alpha/mcp` package exposes the Twilio API as tools, but Twilio calls it a proof of concept. Limit it to the services you need with `--services` or `--tags`. [Docs](https://www.twilio.com/docs/ai/mcp).

## Safety rules for agents with a phone

A phone number lets an agent reach real people and spend real money. Set limits before you hand it over.

- **Use a scoped key.** Give the agent a key for a sub-account or a project with a spend cap, not your main account key.
- **Require approval for outbound actions.** Claude Code asks before each tool call by default. Keep that on for `send_message`, `make_call`, and `buy_number`.
- **Respect consent.** In the US, texting or calling people with an automated system or AI voice needs their consent. Business texts from local numbers need [A2P 10DLC registration](https://numberforagents.com/guides/a2p-10dlc-registration-for-ai-agents).
- **Never use agent numbers for verification bypass.** Using a number to receive one-time codes for accounts you do not own breaks most terms of service.
- **Log everything.** Keep a record of each message and call the agent made.

## Where Numbers for Agents fits

Numbers for Agents is building a number API designed for agents: numbers, SMS, signed webhooks, SIP, and raw WebSocket audio for teams that run their own voice stack. It is in private beta. Join the waitlist below to get access.

## FAQ

### Can Claude make phone calls?

Yes, through an MCP server. Install a telephony MCP server such as AgentPhone, Bland, Retell, or Vapi in Claude Code or Claude Desktop. Claude can then place calls through that provider's tools. The provider runs the voice on the call.

### Can Claude send a text message?

Yes. With AgentPhone's MCP server, Claude can send SMS with `send_message`. With Telnyx's remote MCP server, Claude can call the messaging API. You need a number on that account first.

### Does Twilio have an MCP server?

Yes, but the official one only searches Twilio's docs. The `@twilio-alpha/mcp` package can call the Twilio API, and Twilio labels it a proof of concept.

### Is it safe to give an AI agent a phone number?

It is safe with limits: a scoped API key, a spend cap, approval for outbound messages and calls, and consent from the people the agent contacts.
