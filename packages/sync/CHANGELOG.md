# @william-callao/antonella-sync

## 0.1.0

### Minor Changes

- Creación del paquete: núcleo de **sincronización offline-first reutilizable**, extraído
  de la app Minimarket. Incluye:
  - `LocalDb` — subset async de SQLite que consumen los consumidores (sin acoplar
    `expo-sqlite`).
  - `SyncDomainModule` — contrato de dominio data-driven (ddl, tenantTables,
    invalidateKeys, applyDelta) para que el engine itere dominios sin switch central.
  - `createHttpSyncTransport` — transporte de delta `GET /sync/changes` tipado
    (`SyncPage<T>`), sin dependencias de red.
  - Campana: `BellGate`/`bellShouldPull` (filtra bumps repetidos/regresivos).
  - Estado de sync: cursores por `(domain, tenant, store)` + última campana por tenant
    (`createSyncStateRepo`) y `clearTenantRows` (wipe de un tenant).
  - Migrador del esquema meta (`SYNC_META_SQL`, `migrate`).
  - Helpers SQL genéricos (`upsertRows`, `applyDeletes`, `buildPlaceholders`, `totalCount`,
    `coerceBool`, `coerceNumber`).
  - `createSyncRuntime` — runtime de ciclo de vida (apertura/cierre/serialización de sesión,
    campana, poll de respaldo, foreground, `refreshDomain`), agnóstico del entorno vía
    adaptadores inyectados (`identity`, `queryCache`, `bellSource`, `clock`, `openSession`,
    `closeSession`, `logs`).

### Patch Changes

- `core/domain` (`SyncDomainModule`): separa el payload del espejo del contrato de UI;
  permite agregar/ampliar dominios sin tocar la mecánica del engine.
