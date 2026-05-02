import { useState, useEffect } from 'react';
import { useApp } from '@/lib/app-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings as SettingsIcon, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchModels } from '@/lib/ai';

export function SettingsDialog() {
  const { settings, updateSettings } = useApp();
  const [models, setModels] = useState<{id: string, name: string}[]>([]);
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
      console.error(e);
      setTestStatus('error');
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm border-b pb-2">AI Provider Settings</h3>
            
            <div className="grid gap-2">
              <Label>Provider</Label>
              <Select 
                value={settings.provider} 
                onValueChange={(val: 'openrouter' | 'nvidia') => updateSettings({ provider: val, selectedModel: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="nvidia">NVIDIA NIM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>API Key</Label>
              <Input 
                type="password" 
                value={settings.apiKey} 
                onChange={(e) => updateSettings({ apiKey: e.target.value })} 
                placeholder={`Enter ${settings.provider} API key`}
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="grid gap-2 flex-1">
                <Label>Model</Label>
                <Select 
                  value={settings.selectedModel} 
                  onValueChange={(val) => updateSettings({ selectedModel: val })}
                  disabled={models.length === 0 && !settings.selectedModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
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
                {isLoadingModels ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Fetch Models'}
              </Button>
            </div>
            
            {testStatus === 'success' && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Connection successful</p>}
            {testStatus === 'error' && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Connection failed</p>}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm border-b pb-2">Page Settings</h3>
            
            <div className="grid gap-3">
              <Label>Background Pattern</Label>
              <RadioGroup 
                value={settings.backgroundPattern} 
                onValueChange={(val: 'none' | 'lines' | 'grid') => updateSettings({ backgroundPattern: val })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="r1" />
                  <Label htmlFor="r1">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lines" id="r2" />
                  <Label htmlFor="r2">Lines</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grid" id="r3" />
                  <Label htmlFor="r3">Grid</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
