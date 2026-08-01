# E&P Technologies

# EP Core Architecture v1.0

Status: FROZEN

---

# 1. Purpose

EP Core is the reusable enterprise application foundation for all E&P Technologies products.

The first products built on EP Core:

- E&P Smart POS
- E&P Learning

Future products must use EP Core instead of creating independent foundations.

---

# 2. Core Philosophy

EP Core follows these principles:

## Build Architecture Before Features

The foundation must be stable before product modules are added.

## Reuse Before Rebuild

Common enterprise capabilities belong inside EP Core.

Examples:

- Authentication
- Permissions
- Multi-tenancy
- Storage
- Events
- Logging
- Caching

## Products Depend On Core

Products consume EP Core services.

Core never depends on products.

---

# 3. High-Level Architecture


```
E&P Products

 ┌───────────────────────┐
 │ E&P Smart POS         │
 │ E&P Learning          │
 │ Future Products       │
 └──────────┬────────────┘

            ↓

        EP CORE

 ┌───────────────────────┐
 │ Domain Core           │
 │                       │
 │ Tenant                │
 │ Organization          │
 │ Users                 │
 │ Roles                 │
 │ Permissions           │
 └───────────────────────┘


 ┌───────────────────────┐
 │ Infrastructure Core   │
 │                       │
 │ Events                │
 │ Audit                 │
 │ Cache                 │
 │ Storage               │
 │ Jobs                  │
 │ Notifications         │
 │ Logger                │
 │ Database              │
 └───────────────────────┘
```

---

# 4. Folder Structure


```
src

├── core

│   ├── api

│   ├── auth

│   ├── database

│   ├── events

│   ├── permissions

│   ├── roles

│   ├── tenant

│   ├── organization

│   ├── users

│   ├── cache

│   ├── storage

│   ├── jobs

│   ├── notifications

│   ├── logger

│   └── providers


├── features

│   ├── sales

│   ├── inventory

│   ├── receipts

│   └── dashboard


└── shared
```

---

# 5. Dependency Rules

## Allowed

```
features
    |
    ↓
core
```


Example:

```
Sales Feature

uses

Tenant Service
Permission Service
Storage Service
Event Service
```

---

## Forbidden

```
core
    |
    ↓
features
```

Core must never import:

- sales
- inventory
- POS
- learning
- product-specific code

---

# 6. Feature Module Pattern

Every feature should follow:


```
feature-name

├── components

├── engine

├── hooks

├── pages

├── repositories

├── routes

├── services

├── store

├── types

└── validators
```


Responsibilities:


## Components

UI elements.


## Services

Business operations.


## Repositories

Data access abstraction.


## Engine

Complex business rules.


## Hooks

React integration.


## Types

TypeScript contracts.

---

# 7. Core Module Pattern


Infrastructure modules:


```
module-name

├── types

├── services

├── hooks

├── context

├── provider

└── index.ts
```


Domain modules:


```
module-name

├── types

├── repositories

├── services

├── hooks

├── store

└── index.ts
```

---

# 8. Provider Architecture


All global providers are composed inside:


```
src/core/providers/AppProviders.tsx
```


Current providers:

- TenantProvider
- EventProvider
- FeatureFlagProvider
- CacheProvider
- StorageProvider
- JobProvider


Application entry point:

```
main.tsx

        ↓

ErrorBoundary

        ↓

AppProviders

        ↓

Application
```

---

# 9. Multi-Tenant Ready


EP Core supports:

- Multiple companies
- Multiple shops
- Multiple schools
- Multiple countries


Tenant isolation is a core responsibility.

---

# 10. Internationalization Ready


Products must support:

- Multiple languages
- Multiple currencies
- Multiple regions


Examples:

Thailand:

```
THB
VAT 7%
Thai language
```

Kenya:

```
KES
VAT 16%
English/Swahili
```

---

# 11. Future Database Strategy


Development:

```
In-memory repositories
```

Production:

```
PostgreSQL
+
Supabase
```

The application layer must not depend directly on the database.

---

# 12. Version Freeze Rules


After EP Core v1.0:

Allowed:

- Bug fixes
- Security improvements
- Performance improvements


Not allowed:

- Random architecture changes
- Moving folders without reason
- Breaking module contracts

---

# 13. Products Using EP Core


## E&P Smart POS

Uses:

- Tenant
- Inventory
- Sales
- Payments
- Reports
- Storage
- Events


## E&P Learning

Uses:

- Students
- Teachers
- AI Services
- Content
- Assessments
- Notifications


---

# 14. Final Architecture Status


EP Core v1.0

```
STATUS: FROZEN

Foundation:
COMPLETE

Ready for:
PRODUCT DEVELOPMENT
```

---

E&P Technologies

Building scalable software foundations for global products.