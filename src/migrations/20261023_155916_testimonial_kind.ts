import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`kind\` text DEFAULT 'buyer' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`outcome\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`testimonials\` DROP COLUMN \`kind\`;`)
  await db.run(sql`ALTER TABLE \`testimonials\` DROP COLUMN \`outcome\`;`)
}
