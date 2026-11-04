import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`settings_why_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`topic\` text NOT NULL,
  	\`icon\` text DEFAULT 'check' NOT NULL,
  	\`us\` text NOT NULL,
  	\`them\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_why_rows_order_idx\` ON \`settings_why_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_why_rows_parent_id_idx\` ON \`settings_why_rows\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`why_them\` text DEFAULT 'Typical agent';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`settings_why_rows\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`why_them\`;`)
}
