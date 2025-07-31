// Ini adalah definisi tipe untuk data yang kita gunakan di frontend.
// Strukturnya mencerminkan schema.prisma kita.

export type Tag = {
  id: string;
  name: string;
  slug: string;
  type: string;
  parentId: string | null;
};

export type Song = {
  id: string;
  title: string;
  videoUrl: string;
  lyrics: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string; // Tanggal akan datang sebagai string dalam format ISO
  updatedAt: string;
  tags: Tag[];
};
