'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayIcon, PauseIcon, RefreshIcon } from '@/components/layout/icons';
import { vmApi } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

interface Props {
  vmId:    number;
  status:  string;
  compact?: boolean;
}

export function VMPowerControls({ vmId, status, compact }: Props) {
  const qc        = useQueryClient();
  const isRunning = status === 'running';

  const mutate = useMutation({
    mutationFn: (action: 'start' | 'stop' | 'reboot') => {
      const map = { start: vmApi.start, stop: vmApi.stop, reboot: vmApi.reboot };
      return map[action](vmId);
    },
    onSuccess: (_d, action) => {
      qc.invalidateQueries({ queryKey: ['vms'] });
      qc.invalidateQueries({ queryKey: ['vm', vmId] });
      toast({ title: `VM ${action} initiated`, description: `VMID ${vmId}` });
    },
    onError: (err: any) =>
      toast({ variant: 'destructive', title: 'Action failed', description: err?.message }),
  });

  const busy = mutate.isPending;

  if (compact) {
    // Matches icon-btn style from original shell
    return (
      <div className="flex gap-1" onClick={e => e.preventDefault()}>
        {isRunning ? (
          <>
            <button className="icon-btn" title="Stop"   disabled={busy} onClick={() => mutate.mutate('stop')}>
              <PauseIcon size={13}/>
            </button>
            <button className="icon-btn" title="Reboot" disabled={busy} onClick={() => mutate.mutate('reboot')}>
              <RefreshIcon size={13}/>
            </button>
          </>
        ) : (
          <button className="icon-btn" title="Start" disabled={busy} onClick={() => mutate.mutate('start')}>
            <PlayIcon size={13}/>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {isRunning ? (
        <>
          <button className="btn sm" disabled={busy} onClick={() => mutate.mutate('stop')}>
            <PauseIcon size={12}/>Stop
          </button>
          <button className="btn sm" disabled={busy} onClick={() => mutate.mutate('reboot')}>
            <RefreshIcon size={12}/>Reboot
          </button>
        </>
      ) : (
        <button className="btn primary sm" disabled={busy} onClick={() => mutate.mutate('start')}>
          <PlayIcon size={12}/>Start
        </button>
      )}
    </div>
  );
}
