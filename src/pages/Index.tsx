import { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { FilterState, VideoRecord, Language } from '@/types/video';
import { mockVideos } from '@/data/mockVideos';
import { searchYouTubeVideos } from '@/lib/youtubeApi';
import { FilterPanel } from '@/components/FilterPanel';
import { VideoTable } from '@/components/VideoTable';
import { VideoDetailModal } from '@/components/VideoDetailModal';
import { StatsBar } from '@/components/StatsBar';
import { ScrapeDialog } from '@/components/ScrapeDialog';
import { exportToCSV } from '@/lib/exportCSV';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterState>({
    ageGroups: [],
    genders: [],
    emotions: [],
    regions: [],
    languages: [],
  });
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null);
  const [videos, setVideos] = useState<VideoRecord[]>(mockVideos);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScrape = async (query: string, language: Language | '', maxResults: number) => {
    setIsLoading(true);
    try {
      const results = await searchYouTubeVideos({
        query,
        language: language || undefined,
        maxResults,
      });

      if (results.length === 0) {
        toast({ title: 'No results', description: 'No videos found matching the criteria. Try a different query.' });
        return;
      }

      // Re-index IDs to avoid conflicts
      const newVideos = results.map((v, i) => ({ ...v, id: String(videos.length + i + 1) }));
      setVideos((prev) => [...newVideos, ...prev]);
      toast({
        title: 'Scraping complete',
        description: `Found ${results.length} videos from YouTube`,
      });
    } catch (err: any) {
      toast({
        title: 'Scraping failed',
        description: err.message || 'Failed to fetch from YouTube API',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const newVideos = results.data as VideoRecord[];
          // Re-index IDs to avoid conflicts
          const indexedVideos = newVideos.map((v, i) => ({ ...v, id: String(videos.length + i + 1) }));
          setVideos((prev) => [...indexedVideos, ...prev]);
          toast({
            title: 'Upload complete',
            description: `Added ${indexedVideos.length} videos from the CSV file`,
          });
        },
        error: (error) => {
          toast({
            title: 'Upload failed',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      if (filters.ageGroups.length && !filters.ageGroups.includes(video.ageGroup)) return false;
      if (filters.genders.length && !filters.genders.includes(video.gender)) return false;
      if (filters.emotions.length && !filters.emotions.includes(video.emotion)) return false;
      if (filters.regions.length && !filters.regions.includes(video.region)) return false;
      if (filters.languages.length && !filters.languages.includes(video.language)) return false;
      return true;
    });
  }, [filters, videos]);

  return (
    <div className="flex h-screen bg-background">
      <FilterPanel filters={filters} onFiltersChange={setFilters} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 py-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                <h1 className="text-xl font-semibold tracking-tight">
                  <span className="text-gradient">VidIntel</span>
                </h1>
                <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">
                  v1.0
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-5">
                Video Intelligence & Behavioural Analysis Platform
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ScrapeDialog onScrape={handleScrape} isLoading={isLoading} />
              <Button variant="outline" size="sm" className="font-mono text-xs border-border hover:border-warning/50 hover:text-warning" onClick={handleManualUpload}>
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Manual Upload
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv"
              />
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs border-border hover:border-success/50 hover:text-success"
                onClick={() => exportToCSV(filteredVideos)}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="px-6 py-3 border-b border-border bg-card/50">
          <StatsBar videos={filteredVideos} totalCount={videos.length} />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6 grid-bg">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VideoTable videos={filteredVideos} onSelectVideo={setSelectedVideo} />
          </motion.div>
        </div>
      </main>

      <VideoDetailModal
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
};

export default Index;
