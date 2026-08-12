# MantriOS Frontend V2

A fresh React + Vite SPA (Single Page Application) built without Lovable, designed for easy Vercel deployment.

## Features

- **React 19** with Vite for fast development and builds
- **TanStack Router** for type-safe routing
- **TanStack Query** for efficient data fetching and caching
- **Tailwind CSS** for styling
- **Radix UI** components for accessible UI
- **TypeScript** support
- **No Lovable Dependencies** - clean, maintainable codebase

## Project Structure

```
src/
├── components/        # Reusable React components
│   ├── ui/           # Radix UI-based components
│   └── AppShell.tsx  # Main application layout
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and API client
├── routes/           # TanStack Router pages
└── main.jsx          # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Build

```bash
npm run build
```

Output goes to the `dist/` folder.

### Preview Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-api-url.com
```

## Deploying to Vercel

### Step 1: Connect Repository
- Push this code to a GitHub repository
- Go to [vercel.com](https://vercel.com) and import your repository

### Step 2: Configure Build Settings
- **Root Directory**: `.` (current directory)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add `VITE_API_BASE_URL` with your backend API URL

### Step 4: Deploy
Click **Deploy** button. Vercel will automatically rebuild on each push to main.

## Key Differences from Original Frontend

✅ **Removed:**
- Lovable dependencies (@lovable.dev/vite-tanstack-config)
- SSR (Server-Side Rendering)
- Complex vite-tsconfig-paths configuration

✅ **Kept:**
- All UI components (Radix UI)
- All routes and pages
- API integration (lib/api.ts)
- Data hooks (@tanstack/react-query)
- Styling (Tailwind CSS)

## Build Size Warning

The bundle is ~830KB (gzipped ~243KB). This is large due to:
- Heavy dependencies (recharts, @radix-ui components, etc.)
- Consider code-splitting if needed (use dynamic imports)

## Troubleshooting

### Port 5173 already in use?
```bash
npm run dev -- --port 5174
```

### Build fails with missing modules?
```bash
npm install  # Reinstall all dependencies
npm run build  # Try building again
```

### Styles not loading?
Make sure `src/index.css` includes Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Support

For issues with specific libraries:
- [React Router Documentation](https://tanstack.com/router/latest)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)

## License

Same as parent project (MantriOS)
