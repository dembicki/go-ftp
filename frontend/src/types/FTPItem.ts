export interface FTPItem {
  Name: string;
  Size: number;
  Type: "file" | "folder";
  IsHidden: boolean;
  Modified: string;
}
