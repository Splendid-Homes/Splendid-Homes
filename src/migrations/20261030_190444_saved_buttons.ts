import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`compare_saved\` ADD \`saved_show_btn1\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`compare_saved\` ADD \`saved_show_btn2\` integer DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`compare_saved\` DROP COLUMN \`saved_show_btn1\`;`)
  await db.run(sql`ALTER TABLE \`compare_saved\` DROP COLUMN \`saved_show_btn2\`;`)
}
