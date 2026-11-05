/**
 * Stand-in for `drizzle-kit/api` in the Cloudflare Worker build. Schema tooling only runs from the CLI
 * (`payload migrate:create`), never in the Worker, and the real package cannot be bundled there.
 */
const unavailable = (): never => {
  throw new Error('drizzle-kit is not available in the deployed Worker');
};
export const generateDrizzleJson = unavailable;
export const generateMigration = unavailable;
export const generateSQLiteDrizzleJson = unavailable;
export const generateSQLiteMigration = unavailable;
export const pushSchema = unavailable;
export const pushSQLiteSchema = unavailable;
export const upPgSnapshot = unavailable;
export default {};
