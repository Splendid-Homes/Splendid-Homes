import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`offplan_pages_why_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text DEFAULT 'star',
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`offplan_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`offplan_pages_why_cards_order_idx\` ON \`offplan_pages_why_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`offplan_pages_why_cards_parent_id_idx\` ON \`offplan_pages_why_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`offplan_pages_extra_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`offplan_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`offplan_pages_extra_faqs_order_idx\` ON \`offplan_pages_extra_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`offplan_pages_extra_faqs_parent_id_idx\` ON \`offplan_pages_extra_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`offplan_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`why_eyebrow\` text,
  	\`why_title\` text,
  	\`why_italic\` text,
  	\`f_developer\` text,
  	\`f_community\` text,
  	\`f_year\` text,
  	\`f_budget\` text,
  	\`clear_filters\` text,
  	\`empty_title\` text,
  	\`empty_cta\` text,
  	\`empty_text\` text,
  	\`about_title\` text,
  	\`why_title_p\` text,
  	\`about_note\` text,
  	\`plan_title\` text,
  	\`plan_col_milestone\` text,
  	\`plan_col_share\` text,
  	\`plan_intro\` text,
  	\`plan_note\` text,
  	\`units_title\` text,
  	\`unit_col_type\` text,
  	\`unit_col_size\` text,
  	\`unit_col_from\` text,
  	\`gallery_title\` text,
  	\`amenities_title\` text,
  	\`location_title\` text,
  	\`dev_title\` text,
  	\`faq_title\` text,
  	\`more_eyebrow\` text,
  	\`more_title\` text,
  	\`more_italic\` text,
  	\`more_count\` numeric DEFAULT 3,
  	\`desk_agent_id\` integer,
  	\`contact_intro\` text,
  	\`whatsapp_cta\` text,
  	\`call_cta\` text,
  	\`interest_title\` text,
  	\`interest_cta\` text,
  	\`interest_message\` text,
  	\`wa_message\` text,
  	\`brochure_title\` text,
  	\`brochure_cta\` text,
  	\`show_auto_faqs\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`desk_agent_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`offplan_pages_desk_agent_idx\` ON \`offplan_pages\` (\`desk_agent_id\`);`)
  await db.run(sql`CREATE TABLE \`offplan_pages_numbers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` numeric,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`offplan_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`offplan_pages_numbers_order_parent_idx\` ON \`offplan_pages_numbers\` (\`order\`,\`parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`offplan_pages_why_cards\`;`)
  await db.run(sql`DROP TABLE \`offplan_pages_extra_faqs\`;`)
  await db.run(sql`DROP TABLE \`offplan_pages\`;`)
  await db.run(sql`DROP TABLE \`offplan_pages_numbers\`;`)
}
