# Linktree Clone - Frontend

Angular 21 frontend for the Linktree clone. Built with standalone components, signals, Tailwind CSS v4, and SSR support.

## Features

- **Auth**: Login, register, JWT interceptor, route guard
- **Dashboard**: Add/edit/delete/reorder links (drag & drop), live preview, analytics, share button with QR code
- **Profile**: Edit info, upload avatar, customize theme (gradients, button styles, fonts), manage social links
- **Public Profile**: Dynamic `/:username` route with themed page, social icons, and click tracking
- **Animations**: Fade-in and slide-in transitions on links and UI elements
- **Responsive**: Mobile-first design with Tailwind CSS

## Tech Stack

- [Angular 21](https://angular.dev/) with standalone components and signals
- [Tailwind CSS v4](https://tailwindcss.com/)
- [@angular/cdk](https://material.angular.io/cdk/categories) for drag-and-drop
- [qrcode](https://www.npmjs.com/package/qrcode) for QR generation
- SSR with Angular Universal

## Getting Started

### Prerequisites

- Node.js v18+
- Backend running at `http://localhost:3000`

### 1. Install

```bash
cd linktreeAngular
npm install
```

### 2. Environment

Copy `.env.template` to `.env`:

```env
API_URL=http://localhost:3000
```

### 3. Run

```bash
ng serve
```

Open [http://localhost:4200](http://localhost:4200).

### 4. Build

```bash
ng build
```

Output in `dist/`. The `fileReplacements` in `angular.json` swaps `environment.ts` for `environment.prod.ts` on production builds.

## Project Structure

```
src/app/
├── components/       # Shared components (if any)
├── interceptors/     # HTTP auth interceptor
├── layout/           # Shared navbar layout with <router-outlet>
├── models/           # TypeScript interfaces
├── pages/
│   ├── home/           # Landing page
│   ├── login/          # Login form
│   ├── register/       # Registration form
│   ├── dashboard/      # Link management, analytics, share/QR, live preview
│   ├── profile/        # Edit info, theme, social links
│   └── public-profile/ # Dynamic public page (/:username)
├── pipes/            # Custom pipes
├── services/
│   ├── auth.service.ts     # Auth, token, user state (signals)
│   ├── links.service.ts    # Links CRUD, reorder, analytics
│   └── theme.service.ts    # Theme and social links
├── app.routes.ts          # Lazy-loaded routes
├── app.routes.server.ts   # SSR route config
└── app.config.ts          # App providers
```

## Testing

```bash
ng test        # Unit tests (Vitest)
ng e2e         # End-to-end tests
```

## License

MIT
