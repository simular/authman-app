export interface Account {
  id: string;
  userId: string;
  title: string;
  secret: string;
  url: string;
  icon: string;
  created: string;
  modified: string;
  params: any;
  [name: string]: any;
}

