# Aurelia

A responsive digital-wallet UI inspired by the supplied iOS screen references. The Next.js app includes an entry screen, login and account setup, wallet overview, cards, recipients, AI chat, and a guided send-money flow.

## Run locally

```bash
npm install
npm run dev
```

## Build the shadcn registry

The root [`registry.json`](./registry.json) defines the Aurelia component and its source files. Build the distributable registry JSON with:

```bash
npm run registry:build
```

Deploy the generated `public/r/` directory at the same origin as the app. The registry index will be available at `/r/registry.json`, and the component at `/r/aurelia-wallet.json`. To install the component from a hosted registry, use:

```bash
npx shadcn@latest add https://your-domain.example/r/aurelia-wallet.json
```

Publishing these endpoints makes the registry installable; inclusion in any central registry directory requires submitting the hosted registry URL to that directory separately.
