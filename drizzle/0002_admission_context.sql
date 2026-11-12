ALTER TABLE festival_applications ADD COLUMN selected_tier TEXT;
--> statement-breakpoint
ALTER TABLE festival_funnel_events ADD COLUMN placement TEXT;
--> statement-breakpoint
ALTER TABLE festival_funnel_events ADD COLUMN selected_tier TEXT;
--> statement-breakpoint
ALTER TABLE festival_funnel_events ADD COLUMN participation_format TEXT;
--> statement-breakpoint
ALTER TABLE festival_funnel_events ADD COLUMN error_code TEXT;
--> statement-breakpoint
ALTER TABLE festival_funnel_events ADD COLUMN application_reference TEXT;
