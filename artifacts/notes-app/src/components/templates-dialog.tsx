import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-state';
import { LayoutTemplate } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  emoji: string;
  description: string;
  content: string;
  tags: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 'meeting',
    title: 'Toplantı Notu',
    emoji: '🗓️',
    description: 'Toplantı gündemini, kararları ve aksiyon maddelerini not edin',
    tags: ['toplantı'],
    content: `<h1>Toplantı Notu</h1>
<p><strong>Tarih:</strong> </p>
<p><strong>Katılımcılar:</strong> </p>
<p><strong>Konu:</strong> </p>

<h2>Gündem</h2>
<ul><li><p></p></li></ul>

<h2>Görüşülenler</h2>
<p></p>

<h2>Alınan Kararlar</h2>
<ul><li><p></p></li></ul>

<h2>Aksiyon Maddeleri</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p> </p></li></ul>

<h2>Sonraki Toplantı</h2>
<p></p>`,
  },
  {
    id: 'daily',
    title: 'Günlük',
    emoji: '📔',
    description: 'Günlük düşüncelerinizi, duygularınızı ve deneyimlerinizi yazın',
    tags: ['günlük'],
    content: `<h1>Günlük</h1>
<p><em>Tarih: </em></p>

<h2>Bugün nasıl hissediyorum?</h2>
<p></p>

<h2>Bugün neler yaptım?</h2>
<ul><li><p></p></li></ul>

<h2>Minnettarlıklar</h2>
<ul><li><p></p></li><li><p></p></li><li><p></p></li></ul>

<h2>Yarın için hedefler</h2>
<ul><li><p></p></li></ul>

<h2>Notlar</h2>
<p></p>`,
  },
  {
    id: 'todo',
    title: 'Yapılacaklar',
    emoji: '✅',
    description: 'Görevlerinizi önceliklendirerek takip edin',
    tags: ['yapılacak', 'görev'],
    content: `<h1>Yapılacaklar</h1>

<h2>🔴 Acil</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><p> </p></li>
</ul>

<h2>🟡 Önemli</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><p> </p></li>
</ul>

<h2>🟢 Normal</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><p> </p></li>
</ul>

<h2>📋 Bekleyen</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><p> </p></li>
</ul>`,
  },
  {
    id: 'project',
    title: 'Proje Planı',
    emoji: '🚀',
    description: 'Proje hedefleri, zaman çizelgesi ve kaynak planlaması',
    tags: ['proje'],
    content: `<h1>Proje Planı</h1>
<p><strong>Proje Adı:</strong> </p>
<p><strong>Başlangıç:</strong> &nbsp;&nbsp;<strong>Bitiş:</strong> </p>
<p><strong>Sorumlu:</strong> </p>

<h2>Proje Özeti</h2>
<p></p>

<h2>Hedefler</h2>
<ul><li><p></p></li></ul>

<h2>Kapsam</h2>
<p></p>

<h2>Aşamalar</h2>
<table><tbody>
  <tr><th>Aşama</th><th>Başlangıç</th><th>Bitiş</th><th>Durum</th></tr>
  <tr><td>1. Araştırma</td><td></td><td></td><td></td></tr>
  <tr><td>2. Geliştirme</td><td></td><td></td><td></td></tr>
  <tr><td>3. Test</td><td></td><td></td><td></td></tr>
  <tr><td>4. Yayın</td><td></td><td></td><td></td></tr>
</tbody></table>

<h2>Riskler</h2>
<ul><li><p></p></li></ul>

<h2>Notlar</h2>
<p></p>`,
  },
  {
    id: 'brainstorm',
    title: 'Beyin Fırtınası',
    emoji: '💡',
    description: 'Fikirlerinizi serbestçe keşfedin ve organize edin',
    tags: ['fikir'],
    content: `<h1>Beyin Fırtınası: </h1>
<p><em>Konu: </em></p>

<h2>Ana Fikir</h2>
<blockquote><p></p></blockquote>

<h2>Fikirler</h2>
<ul><li><p></p></li><li><p></p></li><li><p></p></li></ul>

<h2>Artılar &amp; Eksiler</h2>
<table><tbody>
  <tr><th>Artılar ✅</th><th>Eksiler ❌</th></tr>
  <tr><td></td><td></td></tr>
  <tr><td></td><td></td></tr>
</tbody></table>

<h2>Sonuç &amp; Karar</h2>
<p></p>`,
  },
  {
    id: 'weekly',
    title: 'Haftalık Özet',
    emoji: '📊',
    description: 'Haftalık ilerlemenizi değerlendirin ve gelecek haftayı planlayın',
    tags: ['haftalık', 'özet'],
    content: `<h1>Haftalık Özet</h1>
<p><strong>Hafta:</strong> </p>

<h2>Bu Hafta Tamamlananlar</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p> </p></li>
</ul>

<h2>Bu Hafta Tamamlanamadı</h2>
<ul><li><p></p></li></ul>

<h2>Öğrendiklerim</h2>
<ul><li><p></p></li></ul>

<h2>Zorluklar</h2>
<p></p>

<h2>Gelecek Hafta Hedefleri</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><p> </p></li>
</ul>

<h2>Metrikler</h2>
<table><tbody>
  <tr><th>Metrik</th><th>Hedef</th><th>Gerçekleşen</th></tr>
  <tr><td></td><td></td><td></td></tr>
</tbody></table>`,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TemplatesDialog({ open, onClose }: Props) {
  const { createNote } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const handleUse = (template: Template) => {
    createNote({ title: template.title, content: template.content, tags: template.tags });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            Şablon Seç
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {TEMPLATES.map(tmpl => (
            <div
              key={tmpl.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/30 ${
                selected === tmpl.id ? 'border-primary bg-accent/50' : 'border-border'
              }`}
              onClick={() => setSelected(tmpl.id)}
            >
              <div className="text-2xl mb-2">{tmpl.emoji}</div>
              <div className="font-semibold text-sm mb-1">{tmpl.title}</div>
              <div className="text-xs text-muted-foreground mb-3 line-clamp-2">{tmpl.description}</div>
              <Button
                size="sm"
                className="w-full h-7 text-xs"
                variant={selected === tmpl.id ? 'default' : 'outline'}
                onClick={e => { e.stopPropagation(); handleUse(tmpl); }}
              >
                Kullan
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TemplatesButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        title="Şablonlar"
        onClick={() => setOpen(true)}
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
      </Button>
      <TemplatesDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
