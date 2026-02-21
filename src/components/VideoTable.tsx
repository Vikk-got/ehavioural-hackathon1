import { VideoRecord, Emotion } from '@/types/video';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';

const emotionColors: Record<Emotion, string> = {
  Happy: 'bg-success/15 text-success border-success/20',
  Angry: 'bg-destructive/15 text-destructive border-destructive/20',
  Sad: 'bg-info/15 text-info border-info/20',
  Surprise: 'bg-warning/15 text-warning border-warning/20',
  Disgust: 'bg-destructive/10 text-destructive/80 border-destructive/15',
  Fear: 'bg-warning/10 text-warning/80 border-warning/15',
  Neutral: 'bg-muted text-muted-foreground border-border',
};

interface VideoTableProps {
  videos: VideoRecord[];
  onSelectVideo: (video: VideoRecord) => void;
}

export const VideoTable = ({ videos, onSelectVideo }: VideoTableProps) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Video ID</TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Title</TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Method</TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Language</TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Gender</TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Age</TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Region</TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Emotion</TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                No videos match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            videos.map((video, index) => (
              <motion.tr
                key={video.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSelectVideo(video)}
                className="border-b border-border cursor-pointer hover:bg-secondary/30 transition-colors group"
              >
                <TableCell className="font-mono text-xs text-primary">{video.videoId}</TableCell>
                <TableCell className="font-medium text-sm max-w-[200px] truncate">{video.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={video.method === 'Scraped' ? 'border-primary/30 text-primary' : 'border-warning/30 text-warning'}>
                    {video.method}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{video.language}</TableCell>
                <TableCell className="text-sm">{video.gender}</TableCell>
                <TableCell className="font-mono text-sm">{video.ageGroup}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{video.region}</TableCell>
                <TableCell>
                  <Badge className={`${emotionColors[video.emotion]} border text-xs`}>
                    {video.emotion}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{video.duration}</TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
