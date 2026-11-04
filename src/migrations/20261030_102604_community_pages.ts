import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
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
  await db.run(sql`CREATE TABLE \`community_pages_extra_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`community_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`community_pages_extra_faqs_order_idx\` ON \`community_pages_extra_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`community_pages_extra_faqs_parent_id_idx\` ON \`community_pages_extra_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`community_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`all_areas\` text,
  	\`kpi_price\` text,
  	\`kpi_rent\` text,
  	\`kpi_yield\` text,
  	\`kpi_listings\` text,
  	\`available_eyebrow\` text,
  	\`available_title\` text,
  	\`tab_sale\` text,
  	\`tab_rent\` text,
  	\`tab_offplan\` text,
  	\`link_sale\` text,
  	\`link_rent\` text,
  	\`link_offplan\` text,
  	\`per_tab\` numeric DEFAULT 3,
  	\`nearby_count\` numeric DEFAULT 4,
  	\`guide_eyebrow\` text,
  	\`guide_title\` text,
  	\`pros_title\` text,
  	\`pros_italic\` text,
  	\`pros_label\` text,
  	\`cons_label\` text,
  	\`fit_title\` text,
  	\`fit_italic\` text,
  	\`suits_label\` text,
  	\`not_for_label\` text,
  	\`nearby_title\` text,
  	\`nearby_italic\` text,
  	\`toc_pros\` text,
  	\`toc_fit\` text,
  	\`toc_nearby\` text,
  	\`compare_eyebrow\` text,
  	\`compare_title\` text,
  	\`compare_italic\` text,
  	\`compare_intro\` text,
  	\`faq_title\` text,
  	\`rank_by\` text DEFAULT 'yield',
  	\`list_compare_eyebrow\` text,
  	\`list_compare_title\` text,
  	\`list_compare_italic\` text,
  	\`list_compare_intro\` text,
  	\`col_community\` text,
  	\`col_price\` text,
  	\`col_rent\` text,
  	\`col_yield\` text,
  	\`col_listings\` text,
  	\`show_auto_faqs\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`community_pages_life_filters\`;`)
  await db.run(sql`DROP TABLE \`community_pages_extra_faqs\`;`)
  await db.run(sql`DROP TABLE \`community_pages\`;`)
}
