import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`community_pages_card_figures\`;`)
  await db.run(sql`DROP TABLE \`community_pages_life_filters\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`all_areas\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`show_card_chips\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`rank_by\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`list_compare_eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`list_compare_title\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`list_compare_italic\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`list_compare_intro\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`col_community\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`col_price\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`col_rent\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`col_yield\`;`)
  await db.run(sql`ALTER TABLE \`community_pages\` DROP COLUMN \`col_listings\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  await db.run(sql`CREATE TABLE \`community_pages_life_filters\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`want\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`limit\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`community_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`community_pages_life_filters_order_idx\` ON \`community_pages_life_filters\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`community_pages_life_filters_parent_id_idx\` ON \`community_pages_life_filters\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`all_areas\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`show_card_chips\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`rank_by\` text DEFAULT 'yield';`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`list_compare_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`list_compare_title\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`list_compare_italic\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`list_compare_intro\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`col_community\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`col_price\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`col_rent\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`col_yield\` text;`)
  await db.run(sql`ALTER TABLE \`community_pages\` ADD \`col_listings\` text;`)
}
