export interface Account {
  id: string;
  userId: string;
  content: string;
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
