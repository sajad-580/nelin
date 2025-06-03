import { ITheme } from './theme';

export interface IConfig {
  title: string,
  version: string,
  themes: ITheme[],
  defaultTheme: string;
}