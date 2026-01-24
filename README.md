# Nextra Connect Kit Example

A simple documentation site built with Nextra 4.0 framework, following the [official documentation](https://nextra.site/docs/docs-theme/start).

## Getting Started

Install dependencies (if not already installed):

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
nextra-connect-kit-example/
├── app/
│   └── layout.jsx          # Root layout with Nextra Theme configuration
├── pages/
│   └── index.mdx           # Home page content (MDX file)
├── mdx-components.tsx      # MDX components configuration
├── next.config.mjs         # Next.js and Nextra configuration
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## Key Files

- **`app/layout.jsx`**: Root layout file that configures the Nextra Docs Theme with Layout, Navbar, Footer, and Banner components. This follows the [official Nextra documentation](https://nextra.site/docs/docs-theme/start#create-the-root-layout)
- **`pages/index.mdx`**: The home page content written in MDX format, using Next.js Pages Router
- **`next.config.mjs`**: Next.js configuration with Nextra integration
- **`mdx-components.tsx`**: MDX components configuration for custom components

## Implementation Details

This project uses a simple and effective approach:

- **Pages Router** (`pages` directory) for MDX files - Next.js Pages Router natively supports MDX files without any client component wrapper
- **App Router Layout** (`app/layout.jsx`) for Nextra Theme configuration - The App Router layout wraps all Pages Router pages, providing the Nextra Theme UI
- This hybrid approach combines the simplicity of Pages Router for content with the power of App Router for layout configuration
- The `getPageMap()` function is called in the server component to get the page map from the `pages` directory

## Build

Build the production version:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Learn More

- [Nextra Documentation](https://nextra.site/)
- [Nextra Docs Theme Guide](https://nextra.site/docs/docs-theme/start)
- [Next.js Documentation](https://nextjs.org/docs)
