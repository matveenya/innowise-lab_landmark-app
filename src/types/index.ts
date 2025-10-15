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
  longitude: number;
  createdBy: string;
  createdAt: Date;
  averageRating: number;
  visitCount: number;
  photos: string[];
  userRatings: { [userId: string]: number };
}

export interface LandmarkMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  averageRating: number;
}

export interface LandmarkFormData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  userRating: number;
  photos: File[];
}
