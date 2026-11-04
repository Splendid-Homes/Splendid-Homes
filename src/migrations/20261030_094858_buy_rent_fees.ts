import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`listing_pages_buy_chips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`type\` text,
  	\`beds\` text,
  	\`status\` text,
  	\`furnishing\` text,
  	\`min\` numeric,
  	\`max\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`listing_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`listing_pages_buy_chips_order_idx\` ON \`listing_pages_buy_chips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`listing_pages_buy_chips_parent_id_idx\` ON \`listing_pages_buy_chips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`listing_pages_rent_chips\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`type\` text,
  	\`beds\` text,
  	\`status\` text,
  	\`furnishing\` text,
  	\`min\` numeric,
  	\`max\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`listing_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`listing_pages_rent_chips_order_idx\` ON \`listing_pages_rent_chips\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`listing_pages_rent_chips_parent_id_idx\` ON \`listing_pages_rent_chips\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`listing_pages_buy_good\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`listing_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`listing_pages_buy_good_order_idx\` ON \`listing_pages_buy_good\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`listing_pages_buy_good_parent_id_idx\` ON \`listing_pages_buy_good\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`listing_pages_rent_good\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`listing_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`listing_pages_rent_good_order_idx\` ON \`listing_pages_rent_good\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`listing_pages_rent_good_parent_id_idx\` ON \`listing_pages_rent_good\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`listing_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`good_eyebrow\` text,
  	\`buy_good_title\` text,
  	\`buy_good_italic\` text,
  	\`rent_good_title\` text,
  	\`rent_good_italic\` text,
  	\`tiles_title\` text,
  	\`show_market\` integer DEFAULT true,
  	\`market_label\` text,
  	\`alert_cta\` text,
  	\`empty_title\` text,
  	\`empty_clear\` text,
  	\`empty_ask\` text,
  	\`empty_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`listing_pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`communities_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`listing_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`communities_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`listing_pages_rels_order_idx\` ON \`listing_pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`listing_pages_rels_parent_idx\` ON \`listing_pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`listing_pages_rels_path_idx\` ON \`listing_pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`listing_pages_rels_communities_id_idx\` ON \`listing_pages_rels\` (\`communities_id\`);`)
  await db.run(sql`CREATE TABLE \`fees\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`dld_pct\` numeric DEFAULT 4 NOT NULL,
  	\`dld_admin\` numeric DEFAULT 580 NOT NULL,
  	\`vat_pct\` numeric DEFAULT 5 NOT NULL,
  	\`trustee_high\` numeric DEFAULT 4000 NOT NULL,
  	\`trustee_low\` numeric DEFAULT 2000 NOT NULL,
  	\`trustee_threshold\` numeric DEFAULT 500000 NOT NULL,
  	\`buyer_agency_pct\` numeric DEFAULT 2 NOT NULL,
  	\`seller_agency_pct\` numeric DEFAULT 2 NOT NULL,
  	\`rent_agency_pct\` numeric DEFAULT 5 NOT NULL,
  	\`mortgage_reg_pct\` numeric DEFAULT 0.25 NOT NULL,
  	\`mortgage_reg_fee\` numeric DEFAULT 290 NOT NULL,
  	\`bank_fee_pct\` numeric DEFAULT 1 NOT NULL,
  	\`deposit_pct\` numeric DEFAULT 5 NOT NULL,
  	\`deposit_furnished_pct\` numeric DEFAULT 10 NOT NULL,
  	\`golden_visa_aed\` numeric DEFAULT 2000000 NOT NULL,
  	\`buy_costs_label\` text DEFAULT 'about 7%' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`listing_pages_buy_chips\`;`)
  await db.run(sql`DROP TABLE \`listing_pages_rent_chips\`;`)
  await db.run(sql`DROP TABLE \`listing_pages_buy_good\`;`)
  await db.run(sql`DROP TABLE \`listing_pages_rent_good\`;`)
  await db.run(sql`DROP TABLE \`listing_pages\`;`)
  await db.run(sql`DROP TABLE \`listing_pages_rels\`;`)
  await db.run(sql`DROP TABLE \`fees\`;`)
}
