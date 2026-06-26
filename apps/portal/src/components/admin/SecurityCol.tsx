import React, { useState } from 'react'

interface SecurityColProps {
  title: string
  items: [string, boolean][]
}

export const SecurityCol: React.FC<SecurityColProps> = ({ title, items }) => {
  const [vals, setVals] = useState(items.map(i => i[1]))
  return (
    <div>
      <div className="text-xs text-mute fw-6 mb-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</div>
      <div className="flex col gap-2 text-sm">
        {items.map(([l, _], i) => (
          <div key={l} className="flex center between">
            <span>{l}</span>
            <span className={`toggle ${vals[i] ? 'on' : ''}`} onClick={() => setVals(v => v.map((x, idx) => idx === i ? !x : x))}/>
          </div>
        ))}
      </div>
    </div>
  )
}
