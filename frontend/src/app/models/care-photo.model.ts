export interface CarePhoto {
  id: number;
  careId: string;
  fileName: string;
  imageUrl: string;
  altText: string;
  caption?: string;
  displayOrder: number;
  isCover: boolean;
  createdAt: string;
}

export interface UpdateCarePhotoRequest {
  altText: string;
  caption?: string;
  displayOrder?: number;
}

export interface ReorderPhotosRequest {
  photoIdsInOrder: number[];
}
