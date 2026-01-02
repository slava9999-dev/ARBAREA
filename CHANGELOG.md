# Changelog

All notable changes to arbarea-mobile-app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- TypeScript types for all database entities, contexts, and API responses (`src/types/index.ts`)
- Versioned SQL migrations (`supabase/migrations/`)
- Audit log table for tracking INSERT/UPDATE/DELETE on critical tables
- DELETE policy for `individual_orders` and `orders` tables (admin-only)
- Performance indexes on `order_id`, `status`, `user_email` columns
- Schema security: revoked public privileges, explicit grants

### Changed

- Unified `ON DELETE` behavior: both `orders` and `individual_orders` now use `SET NULL`
- Moved `handle_updated_at()` function definition before trigger creation

### Fixed

- Migration order: functions now declared before triggers that depend on them
- Missing RLS DELETE policies for order tables

### Security

- Revoked default privileges from `public` schema
- Added audit logging for forensic analysis
- Explicit grants only for `authenticated` and `service_role`

## [1.0.0] - 2026-01-02

### Added

- Initial release of arbarea-mobile-app
- React 18 + Vite 5 frontend with Tailwind CSS
- Supabase backend with PostgreSQL
- Email, Phone, and Magic Link authentication
- Product catalog with RLS
- Shopping cart with localStorage persistence
- Order management with status tracking
- Individual/custom order requests
- Telegram notifications for orders
- PWA support with offline capabilities
- YooKassa payment integration
- CDEK delivery integration
- AI chat assistant
- Dark theme with glassmorphism design
- Yandex Metrica analytics
- GitHub Actions CI/CD pipeline
