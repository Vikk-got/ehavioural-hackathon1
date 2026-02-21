import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { Language } from '@/types/video';

interface ScrapeDialogProps {
  onScrape: (query: string, language: Language | '', maxResults: number) => Promise<void>;
  isLoading: boolean;
}

export const ScrapeDialog = ({ onScrape, isLoading }: ScrapeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('Indian speaker interview');
  const [language, setLanguage] = useState<Language | ''>('');
  const [maxResults, setMaxResults] = useState(15);

  const handleScrape = async () => {
    await onScrape(query, language, maxResults);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-xs border-border hover:border-primary/50 hover:text-primary">
          <Search className="w-3.5 h-3.5 mr-1.5" />
          Scrape Videos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Scrape YouTube Videos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Search Query</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Indian speaker, Hindi debate, comedy"
              className="bg-surface border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language | '')}>
                <SelectTrigger className="bg-surface border-border">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Max Results</Label>
              <Input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                min={1}
                max={50}
                className="bg-surface border-border"
              />
            </div>
          </div>

          <Button
            onClick={handleScrape}
            disabled={isLoading || !query.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Start Scraping
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
