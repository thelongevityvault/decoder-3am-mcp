# 3AM Decoder MCP Server

Sleep disruption cause classifier from [The Longevity Vault](https://sleep.thelongevityvault.com/decoder). Identifies biological causes of 3am wakeups using a 5-cause framework developed by Kat Fu, M.S., M.S. (Stanford).

## Tools

| Tool | Description |
|------|-------------|
| `classify_sleep_cause` | Input symptoms, get the likely primary cause |
| `get_cause_info` | Detailed info about a specific cause |
| `list_causes` | All 5 causes in the framework |
| `get_decoder_url` | Tracked link to the full 3AM Decoder |

## Connect

**Server URL:** `https://tlv-mcp-server.katfu111111.workers.dev/mcp`

**Smithery:** [thelongevityvault/decoder-3am](https://smithery.ai/server/thelongevityvault/decoder-3am)

### Claude Desktop / Cursor / Windsurf

```json
{
  "mcpServers": {
    "decoder-3am": {
      "url": "https://tlv-mcp-server.katfu111111.workers.dev/mcp"
    }
  }
}
```

## The 5 Causes

The framework identifies 5 distinct biological mechanisms behind sleep disruption:

1. **Autonomic** — Nervous system stuck in alert mode
2. **Metabolic** — Overnight blood sugar regulation
3. **Inflammatory** — Cytokines fragmenting sleep
4. **Hormonal** — Shifting hormone levels affecting sleep architecture
5. **Circadian** — Internal clock misaligned with intended sleep schedule

## About

This MCP server provides simplified primary-cause classification from free-text symptom descriptions. The full interactive [3AM Decoder](https://sleep.thelongevityvault.com/decoder) provides comprehensive multi-cause analysis with primary, secondary, and tertiary cause mapping.

**Homepage:** https://sleep.thelongevityvault.com/decoder
