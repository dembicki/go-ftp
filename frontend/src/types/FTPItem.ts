export interface File {
  Name: string;
  Size: number;
  Type: 'file' | 'folder';
  IsHidden: boolean;
  Modified: string;
}
