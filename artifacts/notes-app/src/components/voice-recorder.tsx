import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/lib/app-state';
import { Note, AudioClip } from '@/lib/types';
import { Mic, Square, Play, Pause, Trash2, MicOff } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  note: Note;
  open: boolean;
  onClose: () => void;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function AudioPlayer({ clip }: { clip: AudioClip }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(clip.dataUrl);
    audioRef.current = audio;
    audio.addEventListener('ended', () => { setPlaying(false); setProgress(0); });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    });
    return () => { audio.pause(); audio.remove(); };
  }, [clip.dataUrl]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggle} className="text-primary hover:text-primary/70 shrink-0">
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0">{formatDuration(clip.duration)}</span>
    </div>
  );
}

export function VoiceRecorderDialog({ note, open, onClose }: Props) {
  const { updateNote } = useApp();
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [supported, setSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) setSupported(false);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const clip: AudioClip = {
            id: crypto.randomUUID(),
            name: `Kayıt ${format(new Date(), 'dd.MM.yyyy HH:mm')}`,
            dataUrl: reader.result as string,
            duration: elapsed,
            createdAt: new Date().toISOString(),
          };
          const clips = [...(note.audioClips ?? []), clip];
          updateNote(note.id, { audioClips: clips });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mr.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch {
      setSupported(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const deleteClip = (clipId: string) => {
    updateNote(note.id, { audioClips: (note.audioClips ?? []).filter(c => c.id !== clipId) });
  };

  const clips = note.audioClips ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Ses Kayıtları
          </DialogTitle>
        </DialogHeader>

        {!supported ? (
          <div className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground">
            <MicOff className="h-8 w-8 opacity-30" />
            <p>Tarayıcınız ses kaydını desteklemiyor veya mikrofon izni reddedildi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              {recording ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-mono text-red-500">{formatDuration(elapsed)}</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={stopRecording} className="gap-2">
                    <Square className="h-3.5 w-3.5" />
                    Durdur
                  </Button>
                </>
              ) : (
                <Button onClick={startRecording} className="gap-2">
                  <Mic className="h-4 w-4" />
                  Ses Kaydet
                </Button>
              )}
            </div>

            {clips.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Kayıtlar</div>
                {clips.map(clip => (
                  <div key={clip.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium truncate flex-1">{clip.name}</span>
                      <button
                        onClick={() => deleteClip(clip.id)}
                        className="text-muted-foreground hover:text-destructive ml-2 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <AudioPlayer clip={clip} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
