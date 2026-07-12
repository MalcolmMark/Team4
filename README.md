# MoMo FraudLink Uganda

MoMo FraudLink Uganda is a frontend prototype for secure fraud-intelligence exchange between Bank of Uganda and regulated financial-sector participants.

## Run in VS Code

Requirements: Node.js 20 or newer and npm 10 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:5173` if the browser does not open automatically. Press `Ctrl+C` in the terminal to stop the server.

## Validate a production build

```bash
npm run typecheck
npm run build
npm run preview
```

The production preview runs at `http://localhost:4173`.

## Prototype boundary

The institution names are used only as realistic demonstration identities. This prototype is not endorsed by, connected to, or integrated with those institutions. Authentication, persistence, APIs, audit integrity, encryption key management and institutional integrations still require a secure backend before production use.
