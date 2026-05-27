# Security

This repository deals with veteran-support workflows, legal-reference material, and optional local case storage. Please handle security and privacy issues carefully.

## Reporting a security issue

Do not open a public issue with exploit details, leaked credentials, or real veteran data.

If you find a security or privacy problem:

- use GitHub security reporting if it is enabled for the repository
- otherwise contact the repository owner through GitHub before posting details publicly

## Sensitive data rules

Never commit:

- SSNs
- VA file numbers
- medical record numbers
- full medical records
- raw C-File exports
- unredacted veteran correspondence
- production API keys or secrets

Use synthetic or redacted examples in tests, screenshots, and bug reports.

## Frontend AI key warning

The app includes a browser-side AI connector panel. Keys entered into a static frontend are not truly secret. Treat them as local testing credentials only, and prefer scoped, revocable keys.

## Storage expectations

The backend should store only the minimum facts needed for planning, drafting, and escalation. If you are adding new case fields, ask whether the field is necessary before persisting it.

## Vulnerability scope

Examples of issues worth reporting:

- unauthorized access to local backend data
- missing access controls if the backend is exposed beyond localhost
- unsafe document upload or rendering behavior
- XSS, credential leakage, or persistent injection paths
- incorrect privacy-mode behavior that stores data unexpectedly
- dangerous default CORS or API exposure problems

## Responsible contribution guidance

If your change touches security, privacy, or data storage:

- describe the risk clearly in your pull request
- explain how you tested it
- document any tradeoffs or remaining gaps
