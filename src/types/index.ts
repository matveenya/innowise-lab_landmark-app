export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longtitude: number;
  createdBy: string;
  createdAt: Date;
  averageRating: number;
  visiteCount: number;
  photos: string[];
  userRatings: { [userId: string]: number };
}

export interface LandmarkFormData {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longtitude: number;
  userRating: number;
  photos: File[];
}
