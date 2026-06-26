import React, { useState } from 'react'
import useTaskStore from '../../store/taskStore'
import useCustomerStore from '../../store/customerStore'
import Icon from '../../lib/icons'
import { Avatar } from '../ui/ui'

interface TasksViewProps {
  openModal: (kind: string, props?: any) => void
  openTask: (id: string) => void
}

export const TasksView: React.FC<TasksViewProps> = ({ openModal, openTask }) => {
  const { tasks, moveTask, deleteTask } = useTaskStore()
  const { customers } = useCustomerStore()
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  const cols = [
    { id: 'Pending', label: 'Pending', accent: 'var(--ink-3)' },
    { id: 'In Progress', label: 'In Progress', accent: 'oklch(0.72 0.14 75)' },
    { id: 'Blocked', label: 'Blocked', accent: 'var(--bad)' },
    { id: 'Done', label: 'Done', accent: 'var(--ok)' },
  ]

  let filteredTasks = tasks
  if (filter === 'urgent') filteredTasks = filteredTasks.filter(t => t.priority === 'Urgent')
  else if (filter === 'mine') filteredTasks = filteredTasks.filter(t => t.assignee === 'Ko Thein')
  else if (filter !== 'all') filteredTasks = filteredTasks.filter(t => t.type === filter)

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
  const onDragEnd = () => { setDragId(null); setOverCol(null) }
  const onDragOver = (e: React.DragEvent, colId: string) => { e.preventDefault(); setOverCol(colId) }
  const onDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    if (dragId) moveTask(dragId, colId)
    onDragEnd()
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Provisioning</h1>
          <p className="page-subtitle">{filteredTasks.length} tasks · {filteredTasks.filter(t => t.status === 'Blocked').length} blocked · {filteredTasks.filter(t => t.priority === 'Urgent').length} urgent · drag cards between columns</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => openModal('newtask')}><Icon name="plus" size={13}/>New task</button>
        </div>
      </div>

      <div className="flex gap-2 mb-3 wrap">
        {[
          { id: 'all', label: 'All tasks' },
          { id: 'urgent', label: 'Urgent only' },
          { id: 'mine', label: 'Assigned to me' },
          { id: 'New', label: 'New' },
          { id: 'Renewal', label: 'Renewal' },
          { id: 'Upgrade', label: 'Upgrade' },
          { id: 'Terminate', label: 'Terminate' },
        ].map(f => (
          <button key={f.id} className={`filter-chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="kanban">
        {cols.map(col => {
          const items = filteredTasks.filter(t => t.status === col.id)
          return (
            <div key={col.id} className="kcol"
              onDragOver={e => onDragOver(e, col.id)}
              onDrop={e => onDrop(e, col.id)}
              style={{
                background: overCol === col.id ? 'var(--accent-soft)' : 'var(--surface-2)',
                borderColor: overCol === col.id ? 'var(--accent)' : 'var(--line)',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
              <div className="kcol-head">
                <span className="title" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: col.accent }}/>
                  {col.label}
                </span>
                <span className="count">{items.length}</span>
                <div style={{ flex: 1 }}/>
                <button className="icon-btn" title="Add task in this column" onClick={() => openModal('newtask', { status: col.id })}>
                  <Icon name="plus" size={13}/>
                </button>
              </div>
              <div className="kcol-body">
                {items.map(t => {
                  const c = customers.find(c => c.id === t.customer)
                  return (
                    <div key={t.id}
                      className="kcard"
                      draggable
                      onDragStart={e => onDragStart(e, t.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => openTask(t.id)}
                      style={{
                        opacity: dragId === t.id ? 0.4 : 1,
                        cursor: 'grab',
                      }}>
                      <div className="flex center gap-2 mb-2">
                        <span className="id-tag">{t.id}</span>
                        {t.priority === 'Urgent' && <span className="pill bad"><span className="dot"/>Urgent</span>}
                        <span className="pill subtle">{t.type}</span>
                        {(t.notes || '').includes('Customer-initiated') && <span className="pill accent"><span className="dot"/>From customer</span>}
                        <div style={{ flex: 1 }}/>
                        <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={e => { e.stopPropagation(); deleteTask(t.id); }} title="Delete">
                          <Icon name="trash" size={11}/>
                        </button>
                      </div>
                      <div className="ttl">{t.title}</div>
                      <div className="meta">
                        <span><Icon name="building" size={11}/> {c?.company}</span>
                        {t.subscription && t.subscription !== '—' && <span><Icon name="clock" size={11}/> {t.subscription}</span>}
                      </div>
                      <div className="flex center between mt-2" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                        <div className="flex center gap-2">
                          {t.assignee !== '—'
                            ? <><Avatar name={t.assignee} size={20}/><span className="text-xs">{t.assignee}</span></>
                            : <span className="text-xs text-mute">Unassigned</span>}
                        </div>
                        <span className="text-xs text-mute">{t.team}</span>
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={() => openModal('newtask', { status: col.id })}
                  style={{
                    padding: '10px',
                    border: '1px dashed var(--line-strong)',
                    background: 'transparent',
                    borderRadius: 8,
                    color: 'var(--ink-3)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                  <Icon name="plus" size={12}/>Add card
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
