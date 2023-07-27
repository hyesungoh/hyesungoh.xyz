import data from './data.json';

export interface IEtcItem {
  name: string;
  descriptions: string[];
}

export interface IEtc {
  title: string;
  list: IEtcItem[];
}

export { data };
