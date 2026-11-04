import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_featured\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_offplan\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_communities\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_services\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_why\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_testimonials\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_sell\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_team\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`sections_insights\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_featured\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_offplan\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_communities\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_services\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_why\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_testimonials\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_sell\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_team\` integer;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`sections_insights\` integer;`)
}
