import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import {
  findCustomerById,
  getCustomerTickets,
  createTicket,
  addTicketReply,
  getCustomerInvoices,
} from '../services/database.js';
import { z } from 'zod';

const router = Router();
router.use(requireAuth, apiLimiter);

// ── GET /me — current customer profile ────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const customer = await findCustomerById(req.customer!.sub);
    if (!customer) return res.status(404).json({ ok: false, error: 'Customer not found' });
    res.json({ ok: true, data: customer });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Failed to fetch profile' });
  }
});

// ── GET /me/tickets ────────────────────────────────────────────────────────
router.get('/me/tickets', async (req, res) => {
  try {
    const tickets = await getCustomerTickets(req.customer!.sub);
    res.json({ ok: true, data: tickets });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Failed to fetch tickets' });
  }
});

// ── POST /me/tickets ───────────────────────────────────────────────────────
const TicketSchema = z.object({
  subject:  z.string().min(1).max(256),
  body:     z.string().min(1),
  priority: z.enum(['Low', 'Normal', 'Urgent']).default('Normal'),
  category: z.string().default('general'),
});

router.post('/me/tickets', async (req, res) => {
  try {
    const data = TicketSchema.parse(req.body);
    const ticket = await createTicket({ customerId: req.customer!.sub, ...data });
    res.status(201).json({ ok: true, data: ticket });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, error: err.errors });
    res.status(500).json({ ok: false, error: 'Failed to create ticket' });
  }
});

// ── POST /me/tickets/:id/reply ─────────────────────────────────────────────
router.post('/me/tickets/:id/reply', async (req, res) => {
  const { body } = req.body ?? {};
  if (!body?.trim()) return res.status(400).json({ ok: false, error: 'Reply body required' });
  try {
    await addTicketReply(req.params.id, req.customer!.name, 'customer', body.trim());
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Failed to add reply' });
  }
});

// ── GET /me/invoices ───────────────────────────────────────────────────────
router.get('/me/invoices', async (req, res) => {
  try {
    const invoices = await getCustomerInvoices(req.customer!.sub);
    res.json({ ok: true, data: invoices });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Failed to fetch invoices' });
  }
});

export default router;
