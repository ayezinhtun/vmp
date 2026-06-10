-- VMP Database Schema
-- Run once on first boot (docker-entrypoint-initdb.d)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Customers ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id     VARCHAR(16) UNIQUE,           -- e.g. C-1043
  name          VARCHAR(128) NOT NULL,
  company       VARCHAR(256),
  email         VARCHAR(256) UNIQUE NOT NULL,
  phone         VARCHAR(32),
  password_hash TEXT NOT NULL,
  kyc_status    VARCHAR(16) NOT NULL DEFAULT 'Pending'
                  CHECK (kyc_status IN ('Pending','Approved','Rejected')),
  salesperson   VARCHAR(128),
  status        VARCHAR(16) NOT NULL DEFAULT 'Active'
                  CHECK (status IN ('Active','Inactive','Suspended')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── VM Assignments (VMID ownership) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS vm_assignments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vm_id       INTEGER NOT NULL,               -- Proxmox VMID (e.g. 101)
  legacy_vm   VARCHAR(16),                    -- e.g. VM-2091
  node_name   VARCHAR(64) NOT NULL DEFAULT 'pve',
  hostname    VARCHAR(128),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, vm_id)
);

CREATE INDEX idx_vm_assignments_customer ON vm_assignments(customer_id);
CREATE INDEX idx_vm_assignments_vmid     ON vm_assignments(vm_id);

-- ── Sessions / Refresh tokens ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  user_agent    TEXT,
  ip_address    INET,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_customer ON sessions(customer_id);
CREATE INDEX idx_sessions_token    ON sessions(refresh_token);

-- ── Tickets ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id     VARCHAR(20) UNIQUE,
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subject       VARCHAR(256) NOT NULL,
  body          TEXT NOT NULL,
  priority      VARCHAR(16) NOT NULL DEFAULT 'Normal'
                  CHECK (priority IN ('Low','Normal','Urgent')),
  status        VARCHAR(20) NOT NULL DEFAULT 'Open'
                  CHECK (status IN ('Open','In Progress','Resolved','Closed')),
  category      VARCHAR(32) DEFAULT 'general',
  assignee      VARCHAR(128),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_replies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_name VARCHAR(128) NOT NULL,
  author_role VARCHAR(16) NOT NULL DEFAULT 'customer'
                CHECK (author_role IN ('customer','staff')),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Invoices ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id   VARCHAR(24) UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  amount      BIGINT NOT NULL,               -- MMK
  currency    VARCHAR(8) NOT NULL DEFAULT 'MMK',
  status      VARCHAR(32) NOT NULL DEFAULT 'Pending',
  issued_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  due_at      DATE NOT NULL,
  paid_at     TIMESTAMPTZ,
  method      VARCHAR(64),
  receipt     VARCHAR(64),
  notes       TEXT
);

-- ── Invoice line items (VM breakdown) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  vm_id       INTEGER,
  legacy_vm   VARCHAR(16),
  description TEXT,
  amount      BIGINT NOT NULL
);

-- ── VM Deployment Requests ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vm_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','In Progress','Completed','Rejected')),
  -- Spec
  hostname        VARCHAR(128) NOT NULL,
  purpose         TEXT,
  vcpu            INTEGER NOT NULL,
  ram_gb          INTEGER NOT NULL,
  volumes         JSONB NOT NULL DEFAULT '[]',   -- [{size:200}]
  bandwidth       VARCHAR(16),
  os_name         VARCHAR(64),
  os_version      VARCHAR(32),
  -- Network
  zone            VARCHAR(64),
  nics            JSONB DEFAULT '[]',
  -- Firewall
  firewall_ports  TEXT[],
  port_forwarding JSONB DEFAULT '[]',
  -- Addons
  backup_enabled  BOOLEAN DEFAULT FALSE,
  backup_freq     VARCHAR(16),
  backup_retention INTEGER,
  monitoring      BOOLEAN DEFAULT FALSE,
  vm_protection   VARCHAR(16) DEFAULT 'none',
  ddos_protection VARCHAR(16) DEFAULT 'none',
  ssl_certificate VARCHAR(16) DEFAULT 'none',
  load_balancer   VARCHAR(16) DEFAULT 'none',
  -- Meta
  notes           TEXT,
  assigned_to     VARCHAR(128),
  assigned_vmid   INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Activity log ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor       VARCHAR(128),
  actor_role  VARCHAR(16),
  kind        VARCHAR(32),
  text        TEXT NOT NULL,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Update trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated   BEFORE UPDATE ON customers   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tickets_updated     BEFORE UPDATE ON tickets     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vm_requests_updated BEFORE UPDATE ON vm_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
