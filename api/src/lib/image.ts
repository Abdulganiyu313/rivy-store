export const pickImage = (p: { imageUrl?: string; images?: string[] }) =>
  p.images?.[0] || p.imageUrl || "/placeholder.png";
