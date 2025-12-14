import { AppLayout } from '@/components/app/AppLayout';
import { useJournal } from '@/hooks/useJournal';
import { JournalEditor } from '@/components/app/JournalEditor';

const Journal = () => {
  const { entries, createEntry, updateEntry, deleteEntry } = useJournal();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Journal</h1>
          <p className="text-muted-foreground mt-1">Capture your thoughts and reflections</p>
        </div>
        <JournalEditor
          entries={entries}
          onCreateEntry={createEntry}
          onUpdateEntry={updateEntry}
          onDeleteEntry={deleteEntry}
        />
      </div>
    </AppLayout>
  );
};

export default Journal;
