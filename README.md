# Showerglade

A webapp made to help manage the usage of showers during Hack Clubs Overglade event in Singapore (2026).

The webapp was / is being developed by [Lopa](https://github.com/Lopa-ok) and [xvcf](https://github.com/RafaeloxMC)

## Getting Started

This project uses [Bun](https://bun.sh/package-manager) as the package manager. If you plan on contributing, please make sure to use Bun.

Install the dependencies:

```bash
bun install
```

Setup HTTPS certificates:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout localhost-key.pem -out localhost.pem \
  -subj "/CN=localhost"
```

Run the development server:

```bash
bun dev
```

Open [https://localhost:3000](https://localhost:3000) with your browser to see the result.
