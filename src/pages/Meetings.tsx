import { AppLayout } from '@/components/app/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

const Meetings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Meetings</h1>
          <p className="text-muted-foreground mt-1">Manage your meetings and notes</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No meetings scheduled yet</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Meetings;
