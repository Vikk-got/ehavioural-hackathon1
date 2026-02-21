import { VideoRecord } from '@/types/video';

export function exportToCSV(videos: VideoRecord[]) {
  const headers = ['Video ID', 'Video Method', 'Language', 'Gender', 'Age Group', 'Region', 'Emotion', 'Description'];
  const rows = videos.map((v) => [
    v.videoId,
    v.method,
    v.language,
    v.gender,
    v.ageGroup,
    v.region,
    v.emotion,
    `"${v.description.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `video-repository-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
