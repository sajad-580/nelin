import IProduct from './product';

export default interface ICategory {
  id: number;
  name: string;
  img: string;
  items?: IProduct[];
}
