import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`properties\` ADD \`floor_plan_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`properties\` ADD \`floor_plan_url\` text;`)
  await db.run(sql`CREATE INDEX \`properties_floor_plan_idx\` ON \`properties\` (\`floor_plan_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_properties\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`ref\` text NOT NULL,
  	\`permit\` text NOT NULL,
  	\`purpose\` text NOT NULL,
  	\`type\` text NOT NULL,
  	\`price\` numeric NOT NULL,
  	\`beds\` numeric NOT NULL,
  	\`baths\` numeric NOT NULL,
  	\`size\` numeric NOT NULL,
  	\`parking\` numeric DEFAULT 0,
  	\`community_id\` integer NOT NULL,
  	\`building\` text NOT NULL,
  	\`developer_id\` integer,
  	\`furnishing\` text DEFAULT 'Unfurnished' NOT NULL,
  	\`completion_status\` text DEFAULT 'Ready' NOT NULL,
  	\`completion\` text,
  	\`view\` text,
  	\`service_charge\` numeric,
  	\`desc\` text NOT NULL,
  	\`video_url\` text,
  	\`tour_url\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`agent_id\` integer NOT NULL,
  	\`listed_at\` text NOT NULL,
  	\`views\` numeric DEFAULT 0,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`community_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`developer_id\`) REFERENCES \`developers\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`agent_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_properties\`("id", "title", "ref", "permit", "purpose", "type", "price", "beds", "baths", "size", "parking", "community_id", "building", "developer_id", "furnishing", "completion_status", "completion", "view", "service_charge", "desc", "video_url", "tour_url", "seo_meta_title", "seo_meta_description", "status", "featured", "agent_id", "listed_at", "views", "slug", "updated_at", "created_at") SELECT "id", "title", "ref", "permit", "purpose", "type", "price", "beds", "baths", "size", "parking", "community_id", "building", "developer_id", "furnishing", "completion_status", "completion", "view", "service_charge", "desc", "video_url", "tour_url", "seo_meta_title", "seo_meta_description", "status", "featured", "agent_id", "listed_at", "views", "slug", "updated_at", "created_at" FROM \`properties\`;`)
  await db.run(sql`DROP TABLE \`properties\`;`)
  await db.run(sql`ALTER TABLE \`__new_properties\` RENAME TO \`properties\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`properties_ref_idx\` ON \`properties\` (\`ref\`);`)
  await db.run(sql`CREATE INDEX \`properties_community_idx\` ON \`properties\` (\`community_id\`);`)
  await db.run(sql`CREATE INDEX \`properties_developer_idx\` ON \`properties\` (\`developer_id\`);`)
  await db.run(sql`CREATE INDEX \`properties_agent_idx\` ON \`properties\` (\`agent_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`properties_slug_idx\` ON \`properties\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`properties_updated_at_idx\` ON \`properties\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`properties_created_at_idx\` ON \`properties\` (\`created_at\`);`)
}
