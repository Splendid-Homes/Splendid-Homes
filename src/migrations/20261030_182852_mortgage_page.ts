import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`mortgage_page_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`mortgage_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`mortgage_page_faqs_order_idx\` ON \`mortgage_page_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`mortgage_page_faqs_parent_id_idx\` ON \`mortgage_page_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`mortgage_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`expat_dep\` numeric DEFAULT 20,
  	\`expat_dep_high\` numeric DEFAULT 30,
  	\`national_dep\` numeric DEFAULT 15,
  	\`national_dep_high\` numeric DEFAULT 25,
  	\`non_res_dep\` numeric DEFAULT 40,
  	\`threshold\` numeric DEFAULT 5000000,
  	\`dbr_pct\` numeric DEFAULT 50,
  	\`max_age\` numeric DEFAULT 65,
  	\`expat_label\` text,
  	\`national_label\` text,
  	\`non_res_label\` text,
  	\`non_res_note\` text,
  	\`default_price\` numeric DEFAULT 3000000,
  	\`default_deposit\` numeric DEFAULT 20,
  	\`default_rate\` numeric DEFAULT 4.25,
  	\`min_term\` numeric DEFAULT 5,
  	\`max_term\` numeric DEFAULT 25,
  	\`max_deposit\` numeric DEFAULT 80,
  	\`max_rate\` numeric DEFAULT 15,
  	\`valuation_fee\` numeric DEFAULT 3150,
  	\`calc_note\` text,
  	\`pre_title\` text,
  	\`pre_italic\` text,
  	\`pre_text\` text,
  	\`pre_cta\` text,
  	\`budget_label\` text,
  	\`budget_hint\` text,
  	\`ltv_eyebrow\` text,
  	\`ltv_title\` text,
  	\`ltv_italic\` text,
  	\`ltv_text1\` text,
  	\`ltv_text2\` text,
  	\`guide_label\` text,
  	\`guide_href\` text,
  	\`col_buyer\` text,
  	\`reviewed\` text,
  	\`faq_title\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`mortgage_page_faqs\`;`)
  await db.run(sql`DROP TABLE \`mortgage_page\`;`)
}
