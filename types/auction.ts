export interface FormData {
  title: string;
  description: string;
  category: string;
  startingBid: number;
  duration: number;
  image: File | null;
}

export interface AuctionDraft {
  title: string;
  description: string;
  category: string;
  startingBid: number;
  endTime: string;
  imageData: string | null;
  lastSaved: string;
} 