import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';
import { Product, ProductWithStock, Stock } from '../types';

const key = process.env.COSMOS_KEY;
const endpoint = process.env.COSMOS_ENDPOINT;
// const cosmosConnectionString = process.env.COSMOS_CONNECTION_STRING;
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
  console.log('req.body : ', req.body);

  const responseProducts = await containerProducts.items
    .query('SELECT * from c')
    .fetchAll();
  const lastProduct: Product =
    responseProducts.resources[responseProducts.resources.length - 1];
  console.log(lastProduct.id.split('sku')[1]);

  const uniqueProductId = `sku${Number(lastProduct.id.split('sku')[1]) + 1}`;

  const responseSingleProduct = await containerProducts.items.upsert<Product>({
    id: uniqueProductId,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
  });

  const responseSingleStock = await containerStocks.items.upsert<Stock>({
    product_id: uniqueProductId,
    count: req.body.count,
  });

  const singleProduct: ProductWithStock = {
    id: (responseSingleProduct.resource as Product).id,
    title: (responseSingleProduct.resource as Product).title,
    description: (responseSingleProduct.resource as Product).description,
    price: (responseSingleProduct.resource as Product).price,
    count: (responseSingleStock.resource as Stock).count,
  };

  context.res = {
    body: singleProduct,
  };
};

export default httpTrigger;
