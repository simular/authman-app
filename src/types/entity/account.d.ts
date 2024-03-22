export interface Account<T = AccountContent> {
  id: string;
  userId: string;
  content: T;
  image: string;
  created: string;
  modified: string | null;
  params: any;
  [name: string]: any;
}

export interface AccountContent {
  title: string;
  secret: string;
  image: string;
  url: string;
}
