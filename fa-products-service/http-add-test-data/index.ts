import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';

const key = process.env.COSMOS_KEY;
const endpoint = process.env.COSMOS_ENDPOINT;

const databaseName = `products-db`;
const containerStocksName = `stocks`;
const containerProductsName = `products`;

const cosmosClient = new CosmosClient({ endpoint, key });

const database = cosmosClient.database(databaseName);
const containerStocks = database.container(containerStocksName);
const containerProducts = database.container(containerProductsName);

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('HTTP trigger function processed a request.');

  context.log('JavaScript HTTP trigger function processed a request.');
  const responseStocks = await containerStocks.items.bulk([
    {
      operationType: 'Upsert',
      resourceBody: { product_id: 'sku1', count: 1 },
    },
    {
      operationType: 'Upsert',
      resourceBody: { product_id: 'sku2', count: 2 },
    },
    {
      operationType: 'Upsert',
      resourceBody: { product_id: 'sku3', count: 3 },
    },
  ]);

  const responseProducts = await containerProducts.items.bulk([
    {
      operationType: 'Upsert',
      resourceBody: {
        id: 'sku1',
        title: 'Table',
        description: 'This is a table',
        price: 30000,
      },
    },
    {
      operationType: 'Upsert',
      resourceBody: {
        id: 'sku2',
        title: 'Chair',
        description: 'This is a chair',
        price: 8000,
      },
    },
    {
      operationType: 'Upsert',
      resourceBody: {
        id: 'sku3',
        title: 'Keyboard',
        description: 'This is a keyboard',
        price: 2500,
      },
    },
  ]);

  context.res = {
    body: {
      stocks: responseStocks.map((res) => res.resourceBody),
      products: responseProducts.map((res) => res.resourceBody),
    },
  };
};

export default httpTrigger;
