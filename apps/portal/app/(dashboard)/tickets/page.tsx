'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { StatusPill } from '@/components/vms/vm-status-badge';
import type { Ticket } from '@/lib/types';

/* ─── Inline icons ───────────────────────────────────────────────── */
function ChevronIcon({ down }: { down: boolean }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {down ? <polyline points="6 9 12 15 18 9"/> : <polyline points="18 15 12 9 6 15"/>}
    </svg>
  );
}
function SendIcon() {
  return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}

export default function TicketsPage() {
  const qc = useQueryClient();
  const [showNew,    setShowNew]    = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reply,      setReply]      = useState('');

  const { data: tickets = [] } = useQuery({ queryKey: ['tickets'], queryFn: customerApi.tickets });

  const createMut = useMutation({
    mutationFn: customerApi.createTicket,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['tickets'] }); setShowNew(false); toast({ title: 'Ticket created' }); },
  });

  const replyMut = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => customerApi.replyTicket(id, message),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['tickets'] }); setReply(''); toast({ title: 'Reply sent' }); },
  });

  const open   = (tickets as Ticket[]).filter(t => t.status === 'Open' || t.status === 'In Progress');
  const closed = (tickets as Ticket[]).filter(t => t.status === 'Resolved' || t.status === 'Closed');

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">{open.length} open · {(tickets as Ticket[]).length} total</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setShowNew(true)}>+ New Ticket</button>
        </div>
      </div>

      {/* New ticket form (inline expand) */}
      {showNew && (
        <NewTicketForm
          onSubmit={d => createMut.mutate(d)}
          onCancel={() => setShowNew(false)}
          pending={createMut.isPending}
        />
      )}

      {/* Active tickets */}
      {open.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-2)', marginBottom: 8 }}>Active</div>
          <div className="card">
            {open.map((t, i) => (
              <TicketRow key={t.id} ticket={t} expanded={expandedId === t.id}
                onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
                reply={reply} setReply={setReply}
                onReply={() => replyMut.mutate({ id: t.id, message: reply })}
                replyPending={replyMut.isPending}
                bordered={i > 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Closed tickets */}
      {closed.length > 0 && (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-2)', marginBottom: 8 }}>Resolved / Closed</div>
          <div className="card">
            {closed.map((t, i) => (
              <TicketRow key={t.id} ticket={t} expanded={expandedId === t.id}
                onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
                reply={reply} setReply={setReply}
                onReply={() => replyMut.mutate({ id: t.id, message: reply })}
                replyPending={replyMut.isPending}
                bordered={i > 0}
              />
            ))}
          </div>
        </div>
      )}

      {(tickets as Ticket[]).length === 0 && !showNew && (
        <div className="card">
          <div className="empty" style={{ padding: '40px 0' }}>
            <div className="title">No tickets yet</div>
            <div className="sub">Open a ticket if you need help from our team.</div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Ticket row (expandable) ─────────────────────────────────────── */
function TicketRow({ ticket, expanded, onToggle, reply, setReply, onReply, replyPending, bordered }: {
  ticket: Ticket; expanded: boolean; onToggle: () => void;
  reply: string; setReply: (v: string) => void; onReply: () => void;
  replyPending: boolean; bordered: boolean;
}) {
  return (
    <div style={{ borderTop: bordered ? '1px solid var(--line)' : undefined }}>
      <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{ticket.subject}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2 }}>{formatDate(ticket.createdAt)}</div>
        </div>
        <StatusPill status={ticket.status}/>
        <button className="icon-btn" style={{ flexShrink: 0 }}><ChevronIcon down={!expanded}/></button>
      </div>

      {expanded && (
        <div style={{ padding: '0 18px 16px 18px', borderTop: '1px solid var(--line)' }}>
          <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(ticket as any).replies?.map((r: any) => (
              <div key={r.id} style={{
                padding: '8px 12px', borderRadius: 6, fontSize: 12.5,
                background: r.authorType === 'staff' ? 'var(--accent-soft)' : 'var(--surface-2)',
                borderLeft: `3px solid ${r.authorType === 'staff' ? 'var(--accent)' : 'var(--line)'}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
                  {r.authorType === 'staff' ? 'Support' : 'You'} · {formatDate(r.createdAt)}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>
              </div>
            ))}
          </div>

          {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <textarea
                className="field" value={reply} onChange={e => setReply(e.target.value)}
                placeholder="Type your reply…"
                style={{ flex: 1, minHeight: 64, resize: 'vertical', padding: 8, fontSize: 12.5 }}
              />
              <button className="btn primary sm" disabled={!reply.trim() || replyPending}
                onClick={onReply} style={{ alignSelf: 'flex-end', height: 32, gap: 6 }}>
                <SendIcon/>Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── New ticket form ─────────────────────────────────────────────── */
function NewTicketForm({ onSubmit, onCancel, pending }: {
  onSubmit: (d: { subject: string; body: string; priority: string; category: string }) => void;
  onCancel: () => void; pending: boolean;
}) {
  const [subject,  setSubject]  = useState('');
  const [message,  setMessage]  = useState('');
  const [priority, setPriority] = useState('Medium');

  const submit = () => {
    if (!subject.trim() || !message.trim()) return;
    onSubmit({ subject, body: message, priority, category: 'General' });
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-head"><h2 className="card-title">Open a new ticket</h2></div>
      <div className="card-body" style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label>Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of your issue" autoFocus/>
        </div>
        <div className="field">
          <label>Priority</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {['Low','Medium','High','Critical'].map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`btn sm ${priority === p ? 'primary' : 'ghost'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Describe the issue in detail…"
            style={{ minHeight: 110, resize: 'vertical', padding: 8, fontSize: 12.5 }}/>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn ghost sm" onClick={onCancel}>Cancel</button>
          <button className="btn primary sm" disabled={!subject.trim() || !message.trim() || pending} onClick={submit}>
            Submit ticket
          </button>
        </div>
      </div>
    </div>
  );
}
