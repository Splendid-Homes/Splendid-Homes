import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`not_found_page_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`not_found_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`not_found_page_links_order_idx\` ON \`not_found_page_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_links_parent_id_idx\` ON \`not_found_page_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`not_found_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`title_italic\` text,
  	\`text\` text,
  	\`search_placeholder\` text,
  	\`search_cta\` text,
  	\`whatsapp_cta\` text,
  	\`show_contact\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`not_found_page_links\`;`)
  await db.run(sql`DROP TABLE \`not_found_page\`;`)
}
