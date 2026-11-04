import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`property_page_extra_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`property_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`property_page_extra_faqs_order_idx\` ON \`property_page_extra_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`property_page_extra_faqs_parent_id_idx\` ON \`property_page_extra_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`property_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`about_title\` text,
  	\`details_title\` text,
  	\`amenities_title\` text,
  	\`about_note\` text,
  	\`costs_buy_title\` text,
  	\`costs_buy_note\` text,
  	\`costs_rent_title\` text,
  	\`costs_rent_note\` text,
  	\`costs_footnote\` text,
  	\`location_title\` text,
  	\`regulatory_title\` text,
  	\`regulatory_note\` text,
  	\`faq_title\` text,
  	\`similar_eyebrow\` text,
  	\`similar_title\` text,
  	\`similar_italic\` text,
  	\`tab_overview\` text,
  	\`tab_details\` text,
  	\`tab_amenities\` text,
  	\`tab_costs\` text,
  	\`tab_location\` text,
  	\`tab_permit\` text,
  	\`tab_qa\` text,
  	\`viewing_cta\` text,
  	\`whatsapp_cta\` text,
  	\`call_cta\` text,
  	\`enquiry_title\` text,
  	\`enquiry_cta\` text,
  	\`enquiry_message\` text,
  	\`wa_message\` text,
  	\`similar_count\` numeric DEFAULT 3,
  	\`match_min\` numeric DEFAULT 50,
  	\`show_reasons\` integer DEFAULT true,
  	\`show_auto_faqs\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`fees\` ADD \`ejari_fee\` numeric DEFAULT 220 NOT NULL;`)
  await db.run(sql`ALTER TABLE \`fees\` ADD \`dewa_apartment\` numeric DEFAULT 2000 NOT NULL;`)
  await db.run(sql`ALTER TABLE \`fees\` ADD \`dewa_villa\` numeric DEFAULT 4000 NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`property_page_extra_faqs\`;`)
  await db.run(sql`DROP TABLE \`property_page\`;`)
  await db.run(sql`ALTER TABLE \`fees\` DROP COLUMN \`ejari_fee\`;`)
  await db.run(sql`ALTER TABLE \`fees\` DROP COLUMN \`dewa_apartment\`;`)
  await db.run(sql`ALTER TABLE \`fees\` DROP COLUMN \`dewa_villa\`;`)
}
