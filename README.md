# Everleap Monorepo

Welcome to the Everleap monorepo! This repository houses the frontend applications and shared packages for the Everleap platform. It is built using [Turborepo](https://turbo.build/repo) and [pnpm workspaces](https://pnpm.io/workspaces).

## 📂 Project Structure

```text
.
├── apps
│   ├── api                 # Hono/Node.js backend API
│   ├── landing             # Next.js Landing Page (everleap.in mirror)
│   └── web                 # Main Next.js Web Application (Dashboard/Platform)
├── packages
│   └── design-system       # Shared UI components (Radix UI + Tailwind CSS)
├── infra                   # Infrastructure configuration (Terraform/Docker)
└── package.json            # Root configuration
```

## 🛠️ Tech Stack

- **Monorepo Manager**: Turborepo
- **Package Manager**: pnpm
- **Frameworks**: Next.js (Web/Landing), Hono (API)
- **Styling**: Tailwind CSS v4, Radix UI
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (required)

**Install pnpm (if not already installed):**
```bash
npm install -g pnpm
# or
corepack enable
```

### Installation

Install dependencies from the root directory:

```bash
pnpm install
```

### 💻 Running Applications

You can run applications individually or all together using Turbo.

#### Option 1: Run All Apps (Recommended for Full Stack Dev)

```bash
npx turbo dev
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **Landing Page**: [http://localhost:3001](http://localhost:3001)
- **API**: [http://localhost:3002](http://localhost:3002)

#### Option 2: Run Individual Apps

If you only need to work on one application, you can run it directly to save resources.

**Landing Page:**
```bash
npx pnpm --filter landing dev
```

**Web App:**
```bash
npx pnpm --filter web dev
```

**API:**
```bash
npx pnpm --filter api dev
```

## 🎨 Design System

Shared UI components are located in `packages/design-system`. These components are used by both `web` and `landing` apps to ensure visual consistency.

- **Usage**: Import components directly from `@everleap/design-system`.
  ```tsx
  import { Button, EverleapLogo } from "@everleap/design-system";
  ```
- **Development**: Changes made in `packages/design-system` are instantly reflected in the running applications thanks to the monorepo setup.

## 🤝 Collaborative Development

1.  **Branching**: Create feature branches from `main`.
2.  **Dependencies**: Always add dependencies to the specific app or package, not the root.
    ```bash
    # Example: Add 'dayjs' to the web app
    pnpm --filter web add dayjs
    ```
3.  **Commits**: Write clear commit messages.
4.  **Pull Requests**: Push your branch and open a PR on GitHub for review.

## ⚠️ Troubleshooting

**"Unable to find package manager binary" error with Turbo:**
This usually means `pnpm` is not in your system PATH.
- **Fix**: Run `npm install -g pnpm`.
- **Workaround**: Run apps individually using the `npx pnpm --filter <app> dev` commands listed above.

## 📦 Building for Production

To build all apps and packages:

```bash
npx turbo build
```

This commands caches build artifacts, so subsequent builds are significantly faster.
