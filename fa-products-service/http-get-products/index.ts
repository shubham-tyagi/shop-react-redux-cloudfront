import { Product, ProductWithStock, Stock } from '../types';
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

const getAllProducts: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('HTTP trigger getSingleProduct function processed a request.');

  const responseStocks = await containerStocks.items
    .query('SELECT * from c')
    .fetchAll();

  const responseProducts = await containerProducts.items
    .query('SELECT * from c')
    .fetchAll();

  const allProducts = responseProducts.resources.map(
    (singleProduct: Product): ProductWithStock => {
      const stockDetailsForProduct: Stock = responseStocks.resources.find(
        (singleStock: Stock) => singleStock.product_id === singleProduct.id
      );
      return {
        id: singleProduct.id,
        title: singleProduct.title,
        description: singleProduct.description,
        price: singleProduct.price,
        count: stockDetailsForProduct?.count,
      };
    }
  );
  context.res = {
    body: allProducts,
  };
};

export default getAllProducts;
