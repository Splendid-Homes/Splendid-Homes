import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` ADD \`show_figures\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`about_team\` ADD \`agents_soon\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`show_figures\`;`)
  await db.run(sql`ALTER TABLE \`about_team\` DROP COLUMN \`agents_soon\`;`)
}
