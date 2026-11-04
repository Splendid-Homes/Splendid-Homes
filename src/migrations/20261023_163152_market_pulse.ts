import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` ADD \`price_change\` numeric;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`yield_change\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`price_change\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`yield_change\`;`)
}
