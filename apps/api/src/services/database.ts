import pg from 'pg';
import { config } from '../config.js';
import type { Customer, VMAssignment } from '../types/index.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.postgresUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// ── Customer queries ───────────────────────────────────────────────────────

export async function findCustomerByEmail(email: string) {
  const { rows } = await pool.query(
    `SELECT id, legacy_id, name, company, email, phone, password_hash,
            kyc_status, salesperson, status, notes
     FROM customers WHERE email = $1`,
    [email.toLowerCase()],
  );
  return rows[0] ?? null;
}

export async function findCustomerById(id: string) {
  const { rows } = await pool.query(
    `SELECT id, legacy_id, name, company, email, phone,
            kyc_status, salesperson, status, notes
     FROM customers WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createCustomer(data: {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  passwordHash: string;
}) {
  const { rows } = await pool.query(
    `INSERT INTO customers (name, company, email, phone, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, kyc_status`,
    [data.name, data.company, data.email.toLowerCase(), data.phone, data.passwordHash],
  );
  return rows[0];
}

// ── VM assignment queries ─────────────────────────────────────────────────

export async function getCustomerVMIds(customerId: string): Promise<number[]> {
  const { rows } = await pool.query(
    `SELECT vm_id FROM vm_assignments WHERE customer_id = $1`,
    [customerId],
  );
  return rows.map((r: { vm_id: number }) => r.vm_id);
}

export async function getCustomerVMAssignments(customerId: string): Promise<VMAssignment[]> {
  const { rows } = await pool.query(
    `SELECT vm_id, legacy_vm, node_name, hostname
     FROM vm_assignments WHERE customer_id = $1
     ORDER BY assigned_at`,
    [customerId],
  );
  return rows.map((r: any) => ({
    vmId:      r.vm_id,
    legacyVm:  r.legacy_vm,
    nodeName:  r.node_name,
    hostname:  r.hostname,
  }));
}

export async function assignVMToCustomer(
  customerId: string,
  vmId: number,
  nodeName: string,
  legacyVm?: string,
  hostname?: string,
) {
  await pool.query(
    `INSERT INTO vm_assignments (customer_id, vm_id, node_name, legacy_vm, hostname)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (customer_id, vm_id) DO UPDATE
       SET node_name = EXCLUDED.node_name,
           legacy_vm = EXCLUDED.legacy_vm,
           hostname  = EXCLUDED.hostname`,
    [customerId, vmId, nodeName, legacyVm, hostname],
  );
}

// ── Tickets ───────────────────────────────────────────────────────────────

export async function getCustomerTickets(customerId: string) {
  const { rows } = await pool.query(
    `SELECT t.id, t.legacy_id, t.subject, t.priority, t.status,
            t.category, t.assignee, t.created_at, t.updated_at,
            t.body,
            COALESCE(
              json_agg(r ORDER BY r.created_at) FILTER (WHERE r.id IS NOT NULL),
              '[]'
            ) AS replies
     FROM tickets t
     LEFT JOIN ticket_replies r ON r.ticket_id = t.id
     WHERE t.customer_id = $1
     GROUP BY t.id
     ORDER BY t.updated_at DESC`,
    [customerId],
  );
  return rows;
}

export async function createTicket(data: {
  customerId: string;
  subject: string;
  body: string;
  priority: string;
  category: string;
}) {
  const { rows } = await pool.query(
    `INSERT INTO tickets (customer_id, subject, body, priority, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, subject, status, priority, created_at`,
    [data.customerId, data.subject, data.body, data.priority, data.category],
  );
  return rows[0];
}

export async function addTicketReply(ticketId: string, authorName: string, authorRole: string, body: string) {
  await pool.query(
    `INSERT INTO ticket_replies (ticket_id, author_name, author_role, body)
     VALUES ($1, $2, $3, $4)`,
    [ticketId, authorName, authorRole, body],
  );
  await pool.query(`UPDATE tickets SET updated_at = NOW() WHERE id = $1`, [ticketId]);
}

// ── VM Requests ───────────────────────────────────────────────────────────

export async function createVMRequest(customerId: string, spec: Record<string, unknown>) {
  const { rows } = await pool.query(
    `INSERT INTO vm_requests
       (customer_id, hostname, purpose, vcpu, ram_gb, volumes, bandwidth,
        os_name, os_version, zone, nics, firewall_ports, port_forwarding,
        backup_enabled, backup_freq, backup_retention, monitoring,
        vm_protection, ddos_protection, ssl_certificate, load_balancer, notes)
     VALUES
       ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
     RETURNING id, hostname, status, created_at`,
    [
      customerId,
      spec.hostname, spec.purpose,
      spec.vcpu, spec.ram,
      JSON.stringify(spec.volumes),
      spec.bandwidth,
      spec.osName, spec.osVersion,
      spec.zone,
      JSON.stringify(spec.nics),
      spec.firewallPorts,
      JSON.stringify(spec.portForwarding),
      spec.backupEnabled, spec.backupFrequency, spec.backupRetention,
      spec.monitoring,
      spec.vmProtection, spec.ddosProtection, spec.sslCertificate, spec.loadBalancer,
      spec.additionalNotes,
    ],
  );
  return rows[0];
}

export async function getCustomerVMRequests(customerId: string) {
  const { rows } = await pool.query(
    `SELECT id, hostname, purpose, status, vcpu, ram_gb, os_name,
            os_version, zone, created_at, updated_at, assigned_to
     FROM vm_requests WHERE customer_id = $1
     ORDER BY created_at DESC`,
    [customerId],
  );
  return rows;
}

// ── Invoices ──────────────────────────────────────────────────────────────

export async function getCustomerInvoices(customerId: string) {
  const { rows } = await pool.query(
    `SELECT i.id, i.legacy_id, i.amount, i.currency, i.status,
            i.issued_at, i.due_at, i.paid_at, i.method, i.receipt,
            COALESCE(json_agg(ii) FILTER (WHERE ii.id IS NOT NULL), '[]') AS items
     FROM invoices i
     LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
     WHERE i.customer_id = $1
     GROUP BY i.id
     ORDER BY i.issued_at DESC`,
    [customerId],
  );
  return rows;
}

// ── Session management ────────────────────────────────────────────────────

export async function createSession(data: {
  customerId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}) {
  await pool.query(
    `INSERT INTO sessions (customer_id, refresh_token, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [data.customerId, data.refreshToken, data.userAgent, data.ipAddress, data.expiresAt],
  );
}

export async function findSession(refreshToken: string) {
  const { rows } = await pool.query(
    `SELECT s.*, c.id as cid, c.email, c.name, c.kyc_status
     FROM sessions s JOIN customers c ON c.id = s.customer_id
     WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
    [refreshToken],
  );
  return rows[0] ?? null;
}

export async function deleteSession(refreshToken: string) {
  await pool.query(`DELETE FROM sessions WHERE refresh_token = $1`, [refreshToken]);
}
