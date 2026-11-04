import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_video_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`settings_hero_video_idx\` ON \`settings\` (\`hero_video_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`company\` text NOT NULL,
  	\`orn\` text NOT NULL,
  	\`tagline\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`whatsapp\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`street\` text NOT NULL,
  	\`address\` text NOT NULL,
  	\`hours\` text NOT NULL,
  	\`lat\` numeric NOT NULL,
  	\`lng\` numeric NOT NULL,
  	\`google_business_profile\` text,
  	\`socials_instagram\` text,
  	\`socials_linkedin\` text,
  	\`socials_youtube\` text,
  	\`socials_tiktok\` text,
  	\`socials_facebook\` text,
  	\`stats_years\` numeric NOT NULL,
  	\`stats_sold\` text NOT NULL,
  	\`stats_clients\` text NOT NULL,
  	\`stats_agents\` numeric NOT NULL,
  	\`hero_title\` text NOT NULL,
  	\`hero_subtitle\` text NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_image_url\` text,
  	\`sections_featured\` integer DEFAULT true,
  	\`sections_offplan\` integer DEFAULT true,
  	\`sections_communities\` integer DEFAULT true,
  	\`sections_services\` integer DEFAULT true,
  	\`sections_why\` integer DEFAULT true,
  	\`sections_testimonials\` integer DEFAULT true,
  	\`sections_sell\` integer DEFAULT true,
  	\`sections_team\` integer DEFAULT true,
  	\`sections_insights\` integer DEFAULT true,
  	\`market_source\` text NOT NULL,
  	\`market_source_url\` text,
  	\`market_updated\` text NOT NULL,
  	\`sheets_enabled\` integer DEFAULT false,
  	\`privacy\` text,
  	\`terms\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_settings\`("id", "company", "orn", "tagline", "phone", "whatsapp", "email", "street", "address", "hours", "lat", "lng", "google_business_profile", "socials_instagram", "socials_linkedin", "socials_youtube", "socials_tiktok", "socials_facebook", "stats_years", "stats_sold", "stats_clients", "stats_agents", "hero_title", "hero_subtitle", "hero_image_id", "hero_image_url", "sections_featured", "sections_offplan", "sections_communities", "sections_services", "sections_why", "sections_testimonials", "sections_sell", "sections_team", "sections_insights", "market_source", "market_source_url", "market_updated", "sheets_enabled", "privacy", "terms", "updated_at", "created_at") SELECT "id", "company", "orn", "tagline", "phone", "whatsapp", "email", "street", "address", "hours", "lat", "lng", "google_business_profile", "socials_instagram", "socials_linkedin", "socials_youtube", "socials_tiktok", "socials_facebook", "stats_years", "stats_sold", "stats_clients", "stats_agents", "hero_title", "hero_subtitle", "hero_image_id", "hero_image_url", "sections_featured", "sections_offplan", "sections_communities", "sections_services", "sections_why", "sections_testimonials", "sections_sell", "sections_team", "sections_insights", "market_source", "market_source_url", "market_updated", "sheets_enabled", "privacy", "terms", "updated_at", "created_at" FROM \`settings\`;`)
  await db.run(sql`DROP TABLE \`settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_settings\` RENAME TO \`settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`settings_hero_image_idx\` ON \`settings\` (\`hero_image_id\`);`)
}
