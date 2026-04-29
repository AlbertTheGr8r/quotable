# Quotable

A lean, flexible application for encoding and sharing professional service pricing tables. Built with Next.js and designed to run completely on your local machine.

## Overview

Quotable allows professionals to define, version, and share pricing tables for their services using YAML. The application dynamically builds quote builders based on these YAML definitions, making it easy to generate accurate quotes for clients.

Inspired by the need for transparent pricing in professional services, Quotable focuses on:
- **Service-specific pricing tables** with support for different calculation strategies
- **Unit conversions** (e.g., hectares to square meters)
- **Versioned rate schedules** (e.g., 2020-2023, 2024-2026)
- **Modifiers and warnings** for special conditions
- **Cross-references** between related services

## Features

- 📊 **Multiple pricing strategies**: Lookup tables, tiered pricing, flat rates, and more
- 🔄 **Unit conversion support** with automatic UI generation
- 🏷️ **Service categorization** (e.g., Isolated Land Surveys, Subdivision Surveys)
- ⚙️ **Configurable modifiers** (percentage-based, multipliers, flat additions)
- 📄 **PDF quote generation** for client delivery
- 💾 **Local storage** using IndexedDB for offline use
- 🎨 **Clean, responsive UI** built with Tailwind CSS and shadcn/ui
- 🔧 **Extensible schema** for adding new professions and service types

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quotable.git
   cd quotable
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Rate Files (YAML)

Pricing tables are defined in YAML files stored in `/public/rates/`. Each file contains:
- **Meta information**: Title, version, currency, VAT rate
- **Unit conversions**: Definitions for converting between units (e.g., sqm to ha)
- **Categories**: Logical grouping of services
- **Services**: Individual service definitions with:
  - ID and label
  - Unit type (area, length, count, time)
  - Pricing strategy (lookup_table, tiered_base_plus_unit, etc.)
  - Strategy-specific parameters
  - Modifiers (optional)
  - Warnings (optional)
  - Cross-references (optional)

See [`public/rates/gepi-2020-2023.yaml`](public/rates/gepi-2020-2023.yaml) for an example.

### Pricing Strategies

Quotable supports several strategies for calculating service costs:

1. **Lookup Table**: Fixed prices based on ranges (e.g., different rates for 0-1ha, 1-2ha, etc.)
2. **Tiered Base + Unit**: Base fee plus per-unit rate within tiers
3. **Tiered Per Unit**: Different per-unit rates based on selected parameters (e.g., contour interval)
4. **Flat Per Unit**: Fixed rate per unit with possible sub-types
5. **Flat**: Fixed base fee regardless of quantity

### Project Structure

```
quotable/
├── public/
│   └── rates/              # YAML rate files
├── src/
│   ├── app/                # Next.js app router
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, schema, engine
│   │   ├── engine/         # Quote calculation logic
│   │   ├── schema/         # Zod schema definitions
│   │   ├── storage/        # IndexedDB wrapper
│   │   └── utils.ts        # Helper functions
│   ├── stores/             # Zustand stores (project, company)
│   └── styles/             # Global styles
└── ...                     # Configuration files
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Schema validation with [Zod](https://zod.dev)
- State management with [Zustand](https://zustand-demo.pmndrs.com)
- Icons from [Lucide](https://lucide.dev)

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.