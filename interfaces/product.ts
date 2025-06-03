export default interface IProduct {
  id: number;
  name: string;
  baseName?: string;
  img?: string;
  item?: this[];
  price?: number;
  options?: any;
  unique?: any;
}
