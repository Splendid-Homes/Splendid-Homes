import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`admin_dashboard\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`monthly_lead_goal\` numeric DEFAULT 30 NOT NULL,
  	\`reply_hours\` numeric DEFAULT 24 NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`leads\` ADD \`source\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`admin_dashboard\`;`)
  await db.run(sql`ALTER TABLE \`leads\` DROP COLUMN \`source\`;`)
}
