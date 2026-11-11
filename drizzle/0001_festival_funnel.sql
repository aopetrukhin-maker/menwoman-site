ALTER TABLE festival_applications ADD COLUMN utm_source TEXT;
--> statement-breakpoint
ALTER TABLE festival_applications ADD COLUMN utm_medium TEXT;
--> statement-breakpoint
ALTER TABLE festival_applications ADD COLUMN utm_campaign TEXT;
--> statement-breakpoint
ALTER TABLE festival_applications ADD COLUMN utm_content TEXT;
--> statement-breakpoint
ALTER TABLE festival_applications ADD COLUMN visit_id TEXT;
--> statement-breakpoint
CREATE TABLE festival_funnel_events (
  id TEXT PRIMARY KEY NOT NULL,
  visit_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (visit_id, event_name)
);
--> statement-breakpoint
CREATE INDEX festival_funnel_events_created_at ON festival_funnel_events (created_at);
