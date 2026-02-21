import { VideoRecord } from '@/types/video';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Clock, MessageSquare, Eye, Activity } from 'lucide-react';

interface VideoDetailModalProps {
  video: VideoRecord | null;
  open: boolean;
  onClose: () => void;
}

export const VideoDetailModal = ({ video, open, onClose }: VideoDetailModalProps) => {
  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{video.title}</DialogTitle>
          <p className="font-mono text-xs text-primary">{video.videoId}</p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <InfoItem icon={<User className="w-4 h-4" />} label="Gender" value={video.gender} />
          <InfoItem icon={<Clock className="w-4 h-4" />} label="Age Group" value={video.ageGroup} />
          <InfoItem icon={<MapPin className="w-4 h-4" />} label="Region" value={video.region} />
          <InfoItem icon={<MessageSquare className="w-4 h-4" />} label="Language" value={video.language} />
          <InfoItem icon={<Activity className="w-4 h-4" />} label="Emotion" value={video.emotion} />
          <InfoItem icon={<Eye className="w-4 h-4" />} label="Method" value={video.method} />
        </div>

        <Separator className="my-4 bg-border" />

        <div className="space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Behavioural Description
          </h3>
          <div className="bg-surface rounded-lg p-4 border border-border">
            <p className="text-sm leading-relaxed text-surface-foreground">
              {video.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span className="font-mono">Added: {video.createdAt}</span>
          <span>•</span>
          <span className="font-mono">Duration: {video.duration}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-surface rounded-lg p-3 border border-border">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
