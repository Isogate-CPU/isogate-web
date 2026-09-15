# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Send a minimal
reproduction and affected package or URL to
[support@isogate.tech](mailto:support@isogate.tech).

Do not include private keys, wallet seed phrases, credentials, personal data,
API tokens, or undisclosed production details in an initial report. We will
acknowledge a report when possible and coordinate a fix or public disclosure
with the reporter.

## Scope and limitations

This repository contains a browser client. It is not an audit or a security
guarantee for the API, smart contracts, RPC providers, wallet integrations, or
any deployment. The client should not receive private signing material, and
`VITE_*` variables must be treated as public because they are embedded in the
bundle. Review network and transaction details independently before signing or
sending funds.
