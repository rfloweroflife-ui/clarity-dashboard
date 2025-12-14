import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { JournalEntry } from '@/hooks/useJournal';
import { format } from 'date-fns';
import { Save, Trash2, Edit2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JournalEditorProps {
  entries: JournalEntry[];
  onCreateEntry: (content: string) => Promise<JournalEntry | null>;
  onUpdateEntry: (id: string, content: string) => Promise<JournalEntry | null>;
  onDeleteEntry: (id: string) => Promise<boolean>;
}

export const JournalEditor = ({
  entries,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
}: JournalEditorProps) => {
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newEntry.trim()) return;
    setIsSubmitting(true);
    const result = await onCreateEntry(newEntry.trim());
    if (result) {
      setNewEntry('');
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    const result = await onUpdateEntry(id, editContent.trim());
    if (result) {
      setEditingId(null);
      setEditContent('');
    }
    setIsSubmitting(false);
  };

  const startEditing = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-6">
      {/* New Entry */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-lg text-foreground mb-4">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </h3>
        <Textarea
          placeholder="What's on your mind today? Write your thoughts, reflections, or anything you want to remember..."
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          rows={5}
          className="resize-none mb-4"
        />
        <div className="flex justify-end">
          <Button onClick={handleCreate} disabled={isSubmitting || !newEntry.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </div>

      {/* Previous Entries */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Previous Entries</h3>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border border-border">
            <p>No journal entries yet. Start writing above!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-card rounded-xl border border-border p-6 group"
            >
              <div className="flex items-start justify-between mb-3">
                <time className="text-sm text-muted-foreground font-medium">
                  {format(new Date(entry.created_at), 'EEEE, MMMM d, yyyy • h:mm a')}
                </time>
                {editingId !== entry.id && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEditing(entry)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {editingId === entry.id ? (
                <div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                    className="resize-none mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(entry.id)}
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
