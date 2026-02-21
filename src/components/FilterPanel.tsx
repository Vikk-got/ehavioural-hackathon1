import { FilterState, AgeGroup, Gender, Emotion, Region, Language } from '@/types/video';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';

const AGE_GROUPS: AgeGroup[] = ['15-25', '26-35', '36-45', '46-55'];
const GENDERS: Gender[] = ['Male', 'Female', 'Unknown'];
const EMOTIONS: Emotion[] = ['Happy', 'Angry', 'Sad', 'Surprise', 'Disgust', 'Fear', 'Neutral'];
const REGIONS: Region[] = ['North India', 'South India', 'East India', 'West India', 'Other'];
const LANGUAGES: Language[] = ['Hindi', 'English'];

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

function FilterSection<T extends string>({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: T[];
  selected: T[];
  onToggle: (item: T) => void;
}) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <label
            key={item}
            className="flex items-center gap-2.5 cursor-pointer group py-1 px-2 rounded hover:bg-secondary/50 transition-colors"
          >
            <Checkbox
              checked={selected.includes(item)}
              onCheckedChange={() => onToggle(item)}
              className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-secondary-foreground group-hover:text-foreground transition-colors">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export const FilterPanel = ({ filters, onFiltersChange }: FilterPanelProps) => {
  const toggle = <T extends string>(key: keyof FilterState, item: T) => {
    const current = filters[key] as T[];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const activeCount =
    filters.ageGroups.length +
    filters.genders.length +
    filters.emotions.length +
    filters.regions.length +
    filters.languages.length;

  const resetFilters = () => {
    onFiltersChange({
      ageGroups: [],
      genders: [],
      emotions: [],
      regions: [],
      languages: [],
    });
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card p-5 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Filters</h2>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary border-0">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <FilterSection title="Language" items={LANGUAGES} selected={filters.languages} onToggle={(item) => toggle('languages', item)} />
      <FilterSection title="Age Group" items={AGE_GROUPS} selected={filters.ageGroups} onToggle={(item) => toggle('ageGroups', item)} />
      <FilterSection title="Gender" items={GENDERS} selected={filters.genders} onToggle={(item) => toggle('genders', item)} />
      <FilterSection title="Emotion" items={EMOTIONS} selected={filters.emotions} onToggle={(item) => toggle('emotions', item)} />
      <FilterSection title="Region" items={REGIONS} selected={filters.regions} onToggle={(item) => toggle('regions', item)} />
    </aside>
  );
};
