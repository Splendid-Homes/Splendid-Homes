import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`legal_pages_pages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`updated\` text,
  	\`about\` text,
  	\`in_footer\` integer DEFAULT true,
  	\`footer_label\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`legal_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`legal_pages_pages_order_idx\` ON \`legal_pages_pages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`legal_pages_pages_parent_id_idx\` ON \`legal_pages_pages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`legal_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`notice\` text,
  	\`show_rera\` integer DEFAULT true,
  	\`rera_line\` text,
  	\`show_contact\` integer DEFAULT true,
  	\`contact_line\` text,
  	\`contact_link\` text,
  	\`updated_label\` text,
  	\`consent_text\` text,
  	\`consent_link\` text,
  	\`consent_page\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`privacy\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`terms\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`legal_pages_pages\`;`)
  await db.run(sql`DROP TABLE \`legal_pages\`;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`privacy\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`terms\` text;`)
}
