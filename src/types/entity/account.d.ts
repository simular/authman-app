export interface Account<T = AccountContent> {
  id: string;
  userId: string;
  content: T;
  created: string;
  modified: string;
  params: any;
  [name: string]: any;
}

export interface AccountContent {
  title: string;
  secret: string;
  icon: string;
  url: string;
}
