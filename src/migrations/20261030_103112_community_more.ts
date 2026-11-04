import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`communities_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_faqs_order_idx\` ON \`communities_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`communities_faqs_parent_id_idx\` ON \`communities_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`community_pages_card_figures\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`community_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`community_pages_card_figures_order_idx\` ON \`community_pages_card_figures\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`community_pages_card_figures_parent_idx\` ON \`community_pages_card_figures\` (\`parent_id\`);`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`show_card_chips\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`show_map\` integer DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`communities_faqs\`;`)
  await db.run(sql`DROP TABLE \`community_pages_card_figures\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`show_card_chips\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`show_map\`;`)
}
