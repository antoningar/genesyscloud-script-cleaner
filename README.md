# Genesys Cloud script cleaner

Function to be able to clean unused objects from agent scripts

## Setup Instructions

### Prerequisites
- Node.js 22 or higher
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

### Project Structure

```
├── src/
│   └── handler.ts          # Lambda handler
├── business/
│   └── example-service.ts  # Business logic and services
├── specs/
│   └── example.feature     # Gherkin test specifications
├── dist/                   # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

### Development

- **Build TypeScript:** `npm run build`
- **Run tests:** `npm run test`
- **Lint code:** `npm run lint`
- **Clean build:** `npm run clean`

### Local Testing

Test the handler directly from command line:

```bash
# Run with default test data
npx ts-node src/handler.ts

# Run with custom JSON data
npx ts-node src/handler.ts '{"name": "test", "value": 123}'
```

### CI/CD

This template includes a GitHub Actions CI workflow that automatically runs on pull requests to the main branch. The CI pipeline:
- Runs `npm test` to execute Cucumber BDD tests
- Runs `npm run lint` for code quality checks
- Runs `npm run build` to verify TypeScript compilation

### Dependencies

- **purecloud-platform-client-v2:** PureCloud SDK
- **@cucumber/cucumber:** BDD testing framework
- **TypeScript:** Type-safe JavaScript development