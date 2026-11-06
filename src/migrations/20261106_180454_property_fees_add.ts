import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`properties\` ADD \`permit_no\` text;`)
  await db.run(sql`UPDATE \`properties\` SET \`permit_no\` = \`permit\`;`)
  await db.run(sql`ALTER TABLE \`properties\` ADD \`authority\` text;`)
  await db.run(sql`ALTER TABLE \`properties\` ADD \`authority_name\` text;`)
  await db.run(sql`ALTER TABLE \`properties\` ADD \`transfer_fee_pct\` numeric;`)
  await db.run(sql`ALTER TABLE \`properties\` ADD \`admin_fee\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`properties\` DROP COLUMN \`permit_no\`;`)
  await db.run(sql`ALTER TABLE \`properties\` DROP COLUMN \`authority\`;`)
  await db.run(sql`ALTER TABLE \`properties\` DROP COLUMN \`authority_name\`;`)
  await db.run(sql`ALTER TABLE \`properties\` DROP COLUMN \`transfer_fee_pct\`;`)
  await db.run(sql`ALTER TABLE \`properties\` DROP COLUMN \`admin_fee\`;`)
}
