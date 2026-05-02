import { useState } from 'react';
import { useApp } from '@/lib/app-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings as SettingsIcon, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchModels } from '@/lib/ai';
import { AppTheme } from '@/lib/types';

const THEMES: { id: AppTheme; label: string; bg: string; fg: string; page: string }[] = [
  { id: 'light',        label: 'Açık',        bg: '#f0ede8', fg: '#2c2a29', page: '#fdfcfb' },
  { id: 'dark',         label: 'Koyu',        bg: '#252320', fg: '#e8e4dc', page: '#2b2826' },
  { id: 'sepia',        label: 'Sepia',       bg: '#ddd0b6', fg: '#3a2a18', page: '#f4ead6' },
  { id: 'apple-yellow', label: 'Apple Not',  bg: '#f7e96a', fg: '#2c2a29', page: '#fefce8' },
  { id: 'dark-blue',    label: 'Gece Mavisi', bg: '#0e1624', fg: '#c8d8e8', page: '#131f2e' },
  { id: 'green-black',  label: 'Terminal',    bg: '#0a0a0a', fg: '#3ddc6a', page: '#111111' },
];

const MARGIN_PRESETS = [
  { label: 'Dar',    top: 48,  bottom: 72,  left: 48,  right: 48  },
  { label: 'Normal', top: 80,  bottom: 120, left: 80,  right: 80  },
  { label: 'Geniş',  top: 120, bottom: 140, left: 128, right: 128 },
];

export function SettingsDialog() {
  const { settings, updateSettings } = useApp();
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleFetchModels = async () => {
    if (!settings.apiKey) return;
    setIsLoadingModels(true);
    setTestStatus('testing');
    try {
      const fetched = await fetchModels(settings.provider, settings.apiKey);
      setModels(fetched);
      setTestStatus('success');
      if (fetched.length > 0 && !fetched.find(m => m.id === settings.selectedModel)) {
        updateSettings({ selectedModel: fetched[0].id });
      }
    } catch (e) {
      setTestStatus('error');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const marginVal = (key: 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight') =>
    String(settings[key] ?? 80);

  const setMargin = (key: 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight', val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0 && n <= 300) updateSettings({ [key]: n });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ayarlar</DialogTitle>
        </DialogHeader>

        <div className="grid gap-7 py-2">

          {/* ── Tema ── */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm border-b pb-2">Tema</h3>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id })}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    settings.theme === t.id
                      ? 'border-primary shadow-md scale-[1.03]'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  title={t.label}
                >
                  {/* Mini preview */}
                  <div className="h-14 flex flex-col" style={{ background: t.bg }}>
                    {/* Toolbar stripe */}
                    <div className="h-3 w-full" style={{ background: t.bg, opacity: 0.7, borderBottom: `1px solid ${t.fg}22` }} />
                    {/* Page */}
                    <div className="flex-1 mx-2 my-1 rounded-sm flex flex-col gap-[3px] px-1.5 pt-1" style={{ background: t.page }}>
                      <div className="h-[3px] rounded-full w-3/4" style={{ background: t.fg, opacity: 0.7 }} />
                      <div className="h-[3px] rounded-full w-full" style={{ background: t.fg, opacity: 0.4 }} />
                      <div className="h-[3px] rounded-full w-5/6" style={{ background: t.fg, opacity: 0.4 }} />
                    </div>
                  </div>
                  <div className="text-[10px] font-medium py-1 text-center" style={{ background: t.bg, color: t.fg }}>
                    {t.label}
                  </div>
                  {settings.theme === t.id && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sayfa Kenar Boşlukları ── */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm border-b pb-2">Sayfa Kenar Boşlukları</h3>

            {/* Presets */}
            <div className="flex gap-2">
              {MARGIN_PRESETS.map(p => {
                const active =
                  settings.marginTop === p.top &&
                  settings.marginBottom === p.bottom &&
                  settings.marginLeft === p.left &&
                  settings.marginRight === p.right;
                return (
                  <button
                    key={p.label}
                    onClick={() => updateSettings({ marginTop: p.top, marginBottom: p.bottom, marginLeft: p.left, marginRight: p.right })}
                    className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom inputs — Word-style: top/bottom/left/right */}
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { key: 'marginTop' as const,    label: 'Üst' },
                  { key: 'marginBottom' as const, label: 'Alt' },
                  { key: 'marginLeft' as const,   label: 'Sol' },
                  { key: 'marginRight' as const,  label: 'Sağ' },
                ]
              ).map(({ key, label }) => (
                <div key={key} className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">{label} (px)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={300}
                    step={8}
                    value={marginVal(key)}
                    onChange={e => setMargin(key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Arka Plan Deseni ── */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm border-b pb-2">Sayfa Deseni</h3>
            <RadioGroup
              value={settings.backgroundPattern}
              onValueChange={(val: 'none' | 'lines' | 'grid') => updateSettings({ backgroundPattern: val })}
              className="flex gap-4"
            >
              {(['none', 'lines', 'grid'] as const).map(v => (
                <div key={v} className="flex items-center space-x-2">
                  <RadioGroupItem value={v} id={`pat-${v}`} />
                  <Label htmlFor={`pat-${v}`} className="capitalize text-sm">
                    {v === 'none' ? 'Yok' : v === 'lines' ? 'Çizgili' : 'Kareli'}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* ── AI Provider ── */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm border-b pb-2">AI Sağlayıcı</h3>

            <div className="grid gap-2">
              <Label>Sağlayıcı</Label>
              <Select
                value={settings.provider}
                onValueChange={(val: 'openrouter' | 'nvidia') => updateSettings({ provider: val, selectedModel: '' })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="nvidia">NVIDIA NIM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>API Anahtarı</Label>
              <Input
                type="password"
                value={settings.apiKey}
                onChange={e => updateSettings({ apiKey: e.target.value })}
                placeholder={`${settings.provider} API anahtarı`}
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="grid gap-2 flex-1">
                <Label>Model</Label>
                <Select
                  value={settings.selectedModel}
                  onValueChange={val => updateSettings({ selectedModel: val })}
                  disabled={models.length === 0 && !settings.selectedModel}
                >
                  <SelectTrigger><SelectValue placeholder="Model seç" /></SelectTrigger>
                  <SelectContent>
                    {settings.selectedModel && models.length === 0 && (
                      <SelectItem value={settings.selectedModel}>{settings.selectedModel}</SelectItem>
                    )}
                    {models.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleFetchModels} disabled={!settings.apiKey || isLoadingModels} variant="secondary">
                {isLoadingModels ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Modelleri Getir'}
              </Button>
            </div>

            {testStatus === 'success' && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Bağlantı başarılı
              </p>
            )}
            {testStatus === 'error' && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Bağlantı başarısız
              </p>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
