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

const getSingleProduct: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  if (req.params.productIdOrTotal === 'total') {
    const responseStocks = await containerStocks.items
      .query('SELECT * from c')
      .fetchAll();

    const total = responseStocks.resources.reduce(
      (previousTotal, singleStock: Stock) => {
        return singleStock.count + previousTotal;
      },
      0
    );
    context.res = {
      body: total,
    };
  } else {
    const productId = req.params.productIdOrTotal;
    const responseStocks = await containerStocks.items
      .query(
        `SELECT s.count FROM stocks s where s.product_id = "sku${productId}"`
      )
      .fetchAll();

    const responseProducts = await containerProducts.items
      .query(
        `SELECT p.id, p.title, p.price, p.description FROM products p where p.id = "sku${productId}"`
      )
      .fetchAll();
    const singleProduct: ProductWithStock = {
      id: (responseProducts.resources[0] as Product).id,
      title: (responseProducts.resources[0] as Product).title,
      description: (responseProducts.resources[0] as Product).description,
      price: (responseProducts.resources[0] as Product).price,
      count: (responseStocks.resources[0] as Stock).count,
    };
    context.log('HTTP trigger getSingleProduct function processed a request.');
    context.res = {
      body: singleProduct,
    };
  }
};

export default getSingleProduct;
