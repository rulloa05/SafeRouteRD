# SafeRoutes Guardian — Project Rules

## Project Overview
SafeRoutes Guardian is a mobile-first Angular web application that suggests safe travel routes based on road conditions, vehicle type (SUV / Sedán), AI analysis, geolocation, and crowdsourced citizen reports. The backend is built with ASP.NET Core (.NET 8+). Currency is Dominican Peso (RD$).

## Tech Stack
- **Front-end:** Angular (latest stable) with standalone components, Angular Router, SCSS, and reactive forms.
- **Back-end:** ASP.NET Core Web API (.NET 8+), Entity Framework Core, SQL Server / PostgreSQL.
- **Auth:** JWT + refresh tokens; OTP verification via email/SMS.
- **Maps:** Leaflet or Google Maps (evaluate during Phase 1).
- **Real-time:** SignalR for live incident updates.
- **CI/CD:** GitHub Actions or Azure DevOps.

## Design System (from Figma prototype)
- **Primary color:** teal/dark-teal family — used for headers, primary buttons, icons, and links.
- **Secondary:** light gray backgrounds, white cards with soft rounded corners and subtle shadows.
- **Accents:** green for success states and ratings; red for alerts and forgot-password links; gold/yellow in logo sparkle.
- **Controls:** pill-shaped buttons, rounded inputs with leading icons, back-arrow top bars.
- **Navigation:** side drawer (hamburger menu) as primary nav; contextual teal header bars per screen.
- **Typography:** clean sans-serif; bold headings, regular body, muted placeholder text.
- **Cards:** white, rounded corners, soft shadow, overlaid on map or light backgrounds.
- Reference images are in `docx_assets/word/media/` (image1–image26).

## Architecture Conventions
- Follow atomic UI design: atoms → molecules → organisms → templates → pages.
- Reuse shared components from a `shared/ui` folder before creating new ones.
- Lazy-load feature modules: `auth`, `map`, `routes`, `calculator`, `profile`.
- Use Angular reactive forms for all user input; always show validation messages.
- Services must be `providedIn: 'root'` singletons unless scoped to a feature.
- Phase 1 uses mock data and local storage; Phase 2 swaps in HTTP-backed services.

## Coding Standards
- Language: TypeScript strict mode.
- Styles: SCSS with BEM naming; mobile-first media queries.
- Linting: ESLint + Prettier; run before every commit.
- File naming: kebab-case for files, PascalCase for classes/components.
- One component per file; co-locate `.ts`, `.html`, `.scss`, `.spec.ts`.

## Logging
- The logger service must log every action unconditionally.
- If required data is undefined or missing, log a default message instead of skipping.

## Back-end Conventions (.NET — Phase 2+)
- Clean architecture: Controllers → Services → Repositories.
- All endpoints under `/api/` prefix.
- Use FluentValidation for request validation.
- Return ProblemDetails for errors.
- Unit tests with xUnit; integration tests with WebApplicationFactory.

## Key Screens (24 in Figma prototype)
1. Splash (light + dark)
2. Login
3. Forgot Password
4. Verify Account
5. Enter OTP
6. Sign Up
7. Map Home
8. Set Destination
9. Schedule Ride
10. Profile Sidebar / Drawer
11. Edit Profile
12. Contact Support
13. Settings
14. Your Bookings (Route History — past/current tabs)
15. Route Comments
16. Route with Image / Media
17. Active Route / Navigation Map
18. Route Home Card (emergency number, gas estimate)
19. Routes Details (active rides metadata)
20. Navigation Active (navigate / stop ride)
21. Gas Calculator Result (Approximate screen — RD$)
22. Vehicle Selection (wireframe)
23. Route Search with comparison (wireframe)
24. Route Detail with alternatives (wireframe)
