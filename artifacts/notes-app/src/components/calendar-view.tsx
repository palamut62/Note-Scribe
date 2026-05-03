import { useState } from 'react';
import { useApp } from '@/lib/app-state';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { tr as dateFnsTr } from 'date-fns/locale';

export function CalendarView() {
  const { notes, setActiveNoteId } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDow = monthStart.getDay();
  const blanks = Array(startDow === 0 ? 6 : startDow - 1).fill(null);

  const notesOnDate = (date: Date) =>
    notes.filter(n => isSameDay(new Date(n.updatedAt), date) || isSameDay(new Date(n.createdAt), date));

  const selectedNotes = selectedDate ? notesOnDate(selectedDate) : [];

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: dateFnsTr })}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}>
                Bugün
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 mb-2">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`b${i}`} />)}
            {days.map(day => {
              const dayNotes = notesOnDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasNotes = dayNotes.length > 0;
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`
                    relative aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-sm
                    transition-colors border
                    ${isSelected ? 'bg-primary text-primary-foreground border-primary' :
                      isToday(day) ? 'bg-primary/10 border-primary/30 text-primary font-semibold' :
                      'border-transparent hover:bg-accent hover:border-border text-foreground'}
                  `}
                >
                  <span className="text-xs font-medium leading-none">{format(day, 'd')}</span>
                  {hasNotes && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-0.5">
                      {dayNotes.slice(0, 3).map((_, i) => (
                        <span
                          key={i}
                          className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground/70' : 'bg-primary'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected date notes panel */}
      <div className="w-72 border-l border-border bg-card/50 p-4 overflow-y-auto">
        {selectedDate ? (
          <>
            <h3 className="font-semibold text-sm mb-3 capitalize">
              {format(selectedDate, 'd MMMM yyyy', { locale: dateFnsTr })}
            </h3>
            {selectedNotes.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8">Bu tarihte not yok.</div>
            ) : (
              <div className="space-y-2">
                {selectedNotes.map(note => (
                  <button
                    key={note.id}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-colors"
                    onClick={() => setActiveNoteId(note.id)}
                  >
                    <div className="font-medium text-sm truncate mb-0.5">{note.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(note.updatedAt), 'HH:mm')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-8">
            Tarihe tıklayarak notları görün
          </div>
        )}
      </div>
    </div>
  );
}
