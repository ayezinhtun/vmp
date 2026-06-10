'use client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RRDPoint } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

interface Props {
  vmId: number;
  data: RRDPoint[];
}

export function RealtimeMetrics({ data }: Props) {
  const formatted = data.map(d => ({
    t:       new Date(d.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu:     +(d.cpu * 100).toFixed(1),
    mem:     +(d.mem / 1024 / 1024 / 1024).toFixed(2),
    netin:   +(d.netin / 1024).toFixed(0),
    netout:  +(d.netout / 1024).toFixed(0),
    diskread:  +(d.diskread / 1024).toFixed(0),
    diskwrite: +(d.diskwrite / 1024).toFixed(0),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <MetricChart title="CPU Usage (%)" data={formatted} dataKey="cpu" color="#3b82f6" unit="%"/>
      <MetricChart title="Memory (GB)" data={formatted} dataKey="mem" color="#8b5cf6" unit=" GB"/>
      <MetricChart title="Network In (KB/s)" data={formatted} dataKey="netin" color="#10b981" unit=" KB/s"/>
      <MetricChart title="Network Out (KB/s)" data={formatted} dataKey="netout" color="#f59e0b" unit=" KB/s"/>
    </div>
  );
}

function MetricChart({ title, data, dataKey, color, unit }: {
  title: string; data: any[]; dataKey: string; color: string; unit: string;
}) {
  return (
    <Card>
      <CardHeader className="py-3 px-5">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
            <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))"/>
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))"/>
            <Tooltip
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
              formatter={(v: number) => [`${v}${unit}`, '']}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }}/>
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
