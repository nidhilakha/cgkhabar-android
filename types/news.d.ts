interface User {
  _id: string;
  name: string;
}

interface Reply {
  user: User;
  content: string;
}

interface Comment {
  user: User;
  content: string;
  replies: Reply[];
}
interface CategoryType {
  _id: string;
  name: string;
}

interface NewsType {
  _id: any;
  title: string;
  content: string;
  // likes: number;
  featured_image?: string;
  // featured_video?: string;
  thumbnail?: string; // Thumbnail for the video
  deleted?: boolean; // Add a flag for deleted news

  // comments: Comment[];
  createdAt:Date;
  category:CategoryType;
  banner:Number;
  yt_url:string;
  author:string;
}
 

// Optionally, if you need types for pagination or filtering
type PaginationParams = {
  page: number;
  limit: number;
};

type FilterParams = {
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
};
