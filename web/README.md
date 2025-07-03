# Blonde Lawyer React App

This is a React application built with TypeScript and Vite, configured for deployment on Vercel.

## Technology Stack

- React 18+
- TypeScript
- Vite
- Vercel for deployment

## Development

This project uses Vite for fast development with HMR (Hot Module Replacement).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deployment on Vercel

This project is configured for easy deployment on Vercel. The `vercel.json` file includes the necessary configuration.

To deploy:

1. Push your code to a Git repository
2. Import the project in Vercel dashboard
3. Vercel will automatically detect the Vite configuration
4. Deploy and get your live URL

## ESLint Configuration

For production applications, we recommend updating the ESLint configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
