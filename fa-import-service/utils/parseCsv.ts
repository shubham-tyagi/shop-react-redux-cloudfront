import { parse, Options } from "csv-parse";

const TITLE_INDEX = 0;
const DESCRIPTION_INDEX = 1;
const PRICE_INDEX = 2;
const COUNT_INDEX = 3;

const parseCsv = (input: Buffer, options: Options = {}): Promise<unknown[]> => {
  return new Promise((resolve, reject): void => {
    parse(input, options, (err, records, info): void => {
      if (err) reject(err);
      else resolve(records);
    });
  });
};

export const parseProducts = async (input: Buffer, options: Options = {}) => {
  const productRows = (await parseCsv(input, options)) as unknown[][];

  return productRows.map(
    (row) =>
      ({
        title: row[TITLE_INDEX],
        description: row[DESCRIPTION_INDEX],
        price: row[PRICE_INDEX],
        count: row[COUNT_INDEX]
      })
  );
};

export default parseCsv;
