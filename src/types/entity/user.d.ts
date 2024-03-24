
export interface User {
  id: string;
  email: string;
  name: string;
  lastReset: string;
  params: any;
  [name: string]: any;
}
