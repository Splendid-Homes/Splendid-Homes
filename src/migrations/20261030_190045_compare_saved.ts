import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`compare_saved_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`compare_saved\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`compare_saved_rows_order_idx\` ON \`compare_saved_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`compare_saved_rows_parent_id_idx\` ON \`compare_saved_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`compare_saved_buy_bands\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`min\` numeric,
  	\`max\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`compare_saved\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`compare_saved_buy_bands_order_idx\` ON \`compare_saved_buy_bands\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`compare_saved_buy_bands_parent_id_idx\` ON \`compare_saved_buy_bands\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`compare_saved_rent_bands\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`min\` numeric,
  	\`max\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`compare_saved\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`compare_saved_rent_bands_order_idx\` ON \`compare_saved_rent_bands\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`compare_saved_rent_bands_parent_id_idx\` ON \`compare_saved_rent_bands\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`compare_saved\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_best\` integer DEFAULT true,
  	\`best_label\` text,
  	\`compare_max\` numeric,
  	\`comparing\` text,
  	\`clear_all\` text,
  	\`property_head\` text,
  	\`add_slot\` text,
  	\`sale_word\` text,
  	\`rent_word\` text,
  	\`landlord_pays\` text,
  	\`picker_title\` text,
  	\`picker_text\` text,
  	\`buy_tab\` text,
  	\`rent_tab\` text,
  	\`location_label\` text,
  	\`all_locations\` text,
  	\`developer_label\` text,
  	\`all_developers\` text,
  	\`price_label\` text,
  	\`any_price\` text,
  	\`match_one\` text,
  	\`match_many\` text,
  	\`empty_title\` text,
  	\`empty_text\` text,
  	\`mixed_note\` text,
  	\`no_match\` text,
  	\`tray_button\` text,
  	\`tray_full\` text,
  	\`saved_empty_title\` text,
  	\`saved_empty_text\` text,
  	\`saved_btn1\` text,
  	\`saved_btn1_href\` text,
  	\`saved_btn2\` text,
  	\`saved_btn2_href\` text,
  	\`saved_one\` text,
  	\`saved_many\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`compare_saved_rows\`;`)
  await db.run(sql`DROP TABLE \`compare_saved_buy_bands\`;`)
  await db.run(sql`DROP TABLE \`compare_saved_rent_bands\`;`)
  await db.run(sql`DROP TABLE \`compare_saved\`;`)
}
