declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: {
    $type: string;
    id: string;
    metadata: {
      $type: string;
      title: string;
      author: string;
      category: string;
      readTime: string;
      date: string;
      featured: boolean;
      status: 'draft' | 'published';
    };
    content: {
      $type: string;
      sections: Array<{
        $type: string;
        id: string;
        type: 'text' | 'code' | 'quote' | 'image';
        content: string;
        metadata?: {
          title?: string;
          language?: string;
          author?: string;
          image?: {
            url: string;
            alt: string;
            caption?: string;
          };
        };
      }>;
      featuredImage?: {
        $type: string;
        url: string;
        alt: string;
        position?: {
          x: number;
          y: number;
        };
      };
    };
  };
  export default content;
} 