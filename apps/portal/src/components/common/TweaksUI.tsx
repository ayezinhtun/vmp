import { TweaksPanel, TweakSection, TweakSelect, TweakText, TweakRadio, TweakColor } from './TweaksPanel'
import { TweakState } from './useTweaks'

interface TweaksUIProps {
  tw: TweakState
  setTweak: (keyOrEdits: keyof TweakState | Partial<TweakState>, value?: any) => void
}

export const TweaksUI = ({ tw, setTweak }: TweaksUIProps) => {
  const setRoleName = (role: string, name: string) => setTweak('roleNames' as keyof TweakState, { ...(tw.roleNames || {}), [role]: name })
  const rn = tw.roleNames || {}
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Role">
        <TweakSelect
          label="View as"
          value={tw.role}
          options={['Admin', 'Sales', 'Engineer', 'Finance', 'Customer'].map(r => ({ value: r, label: rn[r] || r }))}
          onChange={(v) => setTweak('role' as keyof TweakState, v)}
        />
      </TweakSection>
      <TweakSection label="Name role views">
        <TweakText label="Admin" value={rn.Admin || ''} placeholder="Administrator" onChange={v => setRoleName('Admin', v)}/>
        <TweakText label="Sales" value={rn.Sales || ''} placeholder="Sales" onChange={v => setRoleName('Sales', v)}/>
        <TweakText label="Engineer" value={rn.Engineer || ''} placeholder="Engineer" onChange={v => setRoleName('Engineer', v)}/>
        <TweakText label="Finance" value={rn.Finance || ''} placeholder="Finance" onChange={v => setRoleName('Finance', v)}/>
        <TweakText label="Customer" value={rn.Customer || ''} placeholder="Customer" onChange={v => setRoleName('Customer', v)}/>
      </TweakSection>
      <TweakSection label="Appearance">
        <TweakRadio
          label="Theme"
          value={tw.theme}
          options={[{value: 'light', label: 'Light'}, {value: 'dark', label: 'Dark'}]}
          onChange={(v) => setTweak('theme' as keyof TweakState, v)}
        />
        <TweakColor
          label="Accent"
          value={tw.accent}
          options={['#4F6FE3', '#3D9C6E', '#C25A4B', '#8060D4', '#C9883A']}
          onChange={(v) => setTweak('accent' as keyof TweakState, v)}
        />
      </TweakSection>
    </TweaksPanel>
  )
}
