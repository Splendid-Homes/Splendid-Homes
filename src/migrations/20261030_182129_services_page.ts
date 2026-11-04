import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`services_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_faqs_order_idx\` ON \`services_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_faqs_parent_id_idx\` ON \`services_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_page_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_page_faqs_order_idx\` ON \`services_page_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_page_faqs_parent_id_idx\` ON \`services_page_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`talk_cta\` text,
  	\`whatsapp_cta\` text,
  	\`wa_message\` text,
  	\`form_title\` text,
  	\`form_cta\` text,
  	\`form_hint\` text,
  	\`faq_title\` text,
  	\`show_cta\` integer DEFAULT true,
  	\`cta_eyebrow\` text,
  	\`cta_title\` text,
  	\`cta_italic\` text,
  	\`cta_text\` text,
  	\`cta_primary\` text,
  	\`cta_primary_href\` text,
  	\`cta_secondary\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`services\` ADD \`cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`services\` ADD \`cta_href\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`services_faqs\`;`)
  await db.run(sql`DROP TABLE \`services_page_faqs\`;`)
  await db.run(sql`DROP TABLE \`services_page\`;`)
  await db.run(sql`ALTER TABLE \`services\` DROP COLUMN \`cta_label\`;`)
  await db.run(sql`ALTER TABLE \`services\` DROP COLUMN \`cta_href\`;`)
}
