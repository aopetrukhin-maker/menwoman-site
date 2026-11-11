CREATE TABLE festival_applications (
  id TEXT PRIMARY KEY NOT NULL,
  request_id TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('single', 'pair')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  consent_version TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);
--> statement-breakpoint
CREATE TABLE admission_promos (
  code_hash TEXT PRIMARY KEY NOT NULL,
  application_id TEXT NOT NULL REFERENCES festival_applications(id),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE admission_rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  expires_at INTEGER NOT NULL
);
