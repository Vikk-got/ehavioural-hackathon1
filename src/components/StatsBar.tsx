import { VideoRecord } from '@/types/video';
import { Badge } from '@/components/ui/badge';
import { Video, Database, Upload, Download } from 'lucide-react';

interface StatsBarProps {
  videos: VideoRecord[];
  totalCount: number;
}

export const StatsBar = ({ videos, totalCount }: StatsBarProps) => {
  const scraped = videos.filter((v) => v.method === 'Scraped').length;
  const manual = videos.filter((v) => v.method === 'Manual').length;

  return (
    <div className="flex items-center gap-6 text-sm">
      <StatItem icon={<Database className="w-3.5 h-3.5" />} label="Total" value={totalCount} />
      <StatItem icon={<Download className="w-3.5 h-3.5" />} label="Scraped" value={scraped} />
      <StatItem icon={<Upload className="w-3.5 h-3.5" />} label="Manual" value={manual} />
      <StatItem icon={<Video className="w-3.5 h-3.5" />} label="Filtered" value={videos.length} />
    </div>
  );
};

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="font-mono text-xs">{label}:</span>
      <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
