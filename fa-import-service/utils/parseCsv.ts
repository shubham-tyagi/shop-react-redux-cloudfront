import { parse, Options } from "csv-parse";

const parseCsv = (input: Buffer, options: Options = {}): Promise<unknown[]> => {
  return new Promise((resolve, reject): void => {
    parse(input, options, (err, records, info): void => {
      if (err) reject(err);
      else resolve(records);
    });
  });
};

export default parseCsv;
