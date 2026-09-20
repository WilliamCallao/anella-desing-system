# @william-callao/antonella-sync

Mecanismo de **sincronización offline-first reutilizable**: transporte HTTP de delta,
campana (bell gate), estado de sync (cursores + última campana), helpers SQL genéricos,
migrador del esquema meta, motor de pull (`SyncEngine`) y **runtime** de ciclo de vida.

No depende de ninguna app: todo lo específico del entorno entra por **interfaces
inyectadas** (`LocalDb`, `LogSink`, adaptadores del runtime). No importa `expo-sqlite`,
`firebase` ni `logwood` — el consumidor los aporta.

---

## Instalación y consumo

Se publica como `@william-callao/antonella-sync`. La app Minimarket lo consume; en
desarrollo local resuelve al fuente del monorepo vía Metro (`npm run use:local`).

```ts
import {
  createHttpSyncTransport,
  createSyncRuntime,
  createSyncStateRepo,
  migrate,
  SYNC_META_SQL,
  upsertRows,
  applyDeletes,
  // ...
} from "@william-callao/antonella-sync";
```

---

## Mapa de exports

| Módulo | Qué expone |
|---|---|
| `core/db` | `LocalDb` (subset async de SQLite), `SQLiteBindValue`, `SQLiteBindParams`, `SQLiteRunResult` |
| `core/domain` | `SyncDomainModule`, `DomainDeltaPage` (contrato de un dominio syncable) |
| `core/transport` | `SyncTransport`, `SyncHint`, `SyncPage<T>`, `SyncRequest`, `createHttpSyncTransport`, `SYNC_CHANGES_PATH`, `SYNC_PAGE_SIZE` |
| `core/bell` | `BellBump`, `bellShouldPull`, `BellGate` |
| `core/syncState` | `SyncStateRepo`, `createSyncStateRepo`, `clearTenantRows`, `SyncStateTableSpec` |
| `core/schema` | `SYNC_META_SQL`, `META_SYNC_STEP`, `migrate` |
| `core/session` | helpers puros de lifecycle (`shouldOpenSync`, `resolveSessionTenant`, backoff de apertura) |
| `core/sql/upsert` | `upsertRows`, `applyDeletes`, `buildPlaceholders`, `totalCount` |
| `core/sql/coerce` | `coerceBool`, `coerceNumber` |
| `core/errors` | `isRetryableError` (contrato estructural `{ retryable: true }`) |
| `core/logs` | `LogSink`, `noopLogSink` |
| `runtime/syncRuntime` | `createSyncRuntime`, `SyncRuntime`, `SyncRuntimeConfig`, `RuntimeSession`, `RuntimeIdentity`, `RuntimeQueryCache`, `RuntimeBellSource`, `RuntimeClock`, `RuntimePullResult` |

---

## Contrato de un dominio (`SyncDomainModule`)

El consumidor define **un módulo por dominio**; el engine los itera (sin switch central):

```ts
interface SyncDomainModule {
  readonly domain: string;                 // id del dominio = el que espera /sync/changes
  readonly ddl: readonly string[];         // DDL de negocio (el consumidor lo compone con SYNC_META_SQL)
  readonly tenantTables: readonly string[];// tablas a limpiar en un wipe de tenant
  readonly invalidateKeys: readonly string[];// prefijos de queryKeys a invalidar tras un pull OK
  applyDelta(args: { db: LocalDb; page: DomainDeltaPage; tenantId: string; storeId?: string }): Promise<void>;
}
```

`applyDelta` aplica UNA página (upserts + tombstones) y abre su propia transacción
exclusiva. El engine serializa los `applyDelta` de dominios distintos (una sola
transacción exclusiva de SQLite a la vez).

---

## Motor de pull (`createSyncEngine`)

Vive en el consumidor (`sync/engine/engine.ts`), sobre el contrato de dominio. Recap:

- `pull(domain)`: single-flight por `domain:tenant:store`; barre páginas con el mismo
  `since`; **persiste el cursor solo al cerrar el batch** (`has_more=false`).
- `bootstrap()`: pull secuencial de los dominios activos; nunca rechaza.
- Write-lock global (`withWriteLock`) que serializa `applyDelta` + `setCursor`.

---

## Runtime de ciclo de vida (`createSyncRuntime`)

El cerebro del sync, agnóstico del entorno. El consumidor cablea **adaptadores**:

```ts
createSyncRuntime({
  identity,     // { getStatus, getTenantId }   (auth + tenant)
  queryCache,   // { invalidate(domain), clear() }
  bellSource,   // { subscribe(tenant, cb) }
  clock,        // { setInterval, clearInterval, onForeground? }
  logs?,        // LogSink opcional
  pollIntervalMs?,
  openSession,  // (tenant) => RuntimeSession   (db + engine)
  closeSession, // (session, { cleanData }) => void
  foldPullFailure?,
});
```

Responsabilidades: abrir/cerrar/serializar la sesión según identidad (epoch anti-race),
suscripción a la campana por tenant + `BellGate`, poll de respaldo + foreground →
`refreshAll`, `refreshDomain` puntual, y `settleBump` para refrescos post-pull.

---

## Cómo lo usa la app Minimarket

- `src/sync/schema.ts`: compone `BUSINESS_SQL` (de `domains/`) + `SYNC_META_SQL` y llama
  al migrador `migrate(db, steps)` con versionado `PRAGMA user_version`.
- `src/sync/domains/*`: un `SyncDomainModule` por dominio (products, classifications,
  selling-units, assignments, prices, accounts, journal, accounting-config, stock).
- `src/sync/repos/*`: aplican/leen el delta usando `upsertRows`/`applyDeletes`/`coerce*`.
- `src/sync/engine/engine.ts`: `createSyncEngine` data-driven sobre los módulos.
- `src/sync/react/SyncProvider.tsx`: cablea `createSyncRuntime` con adaptadores de la app
  (auth, React Query, Firebase `subscribeBell`, AppState, `logwood`, `expo-sqlite`).
- `src/sync/react/readLocal.ts`: adaptadores local-first (espejo → HTTP fallback).

As-built de la app: `Minimarket_app/docs/documentation/offline-sync/README.md`.
As-built del backend (contrato `/sync/changes`, bell RTDB, dominios):
`platform-core/docs/specialized-services/mini-market/SYNC-OFFLINE-FIRST.md`.

---

## Desarrollo

```sh
pnpm --filter @william-callao/antonella-sync typecheck
pnpm --filter @william-callao/antonella-sync test
pnpm --filter @william-callao/antonella-sync build   # tsup
```

Los tests corren en Node con `better-sqlite3` (misma sintaxis SQL que `expo-sqlite`).
