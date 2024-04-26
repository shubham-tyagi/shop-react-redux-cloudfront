import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';
import { Product, ProductWithStock, Stock } from '../types';

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
  try {
    context.log('HTTP trigger function processed a request.');

    if (
      !req.body.title ||
      !req.body.description ||
      !req.body.price ||
      !req.body.count
    ) {
      throw Error('All Fields Are not present');
    }

    const responseProducts = await containerProducts.items
      .query('SELECT * from c')
      .fetchAll();
      
    const lastProduct: Product = responseProducts.resources.length
      ? responseProducts.resources[responseProducts.resources.length - 1]
      : {
          id: 'sku0',
        };

    const uniqueProductId = `sku${Number(lastProduct.id.split('sku')[1]) + 1}`;

    const responseSingleProduct = await containerProducts.items.upsert<Product>(
      {
        id: uniqueProductId,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
      }
    );

    const responseSingleStock = await containerStocks.items.upsert<Stock>({
      product_id: uniqueProductId,
      count: req.body.count,
    });

    const singleProduct: ProductWithStock = {
      id: responseSingleProduct.resource.id,
      title: responseSingleProduct.resource.title,
      description: responseSingleProduct.resource.description,
      price: responseSingleProduct.resource.price,
      count: responseSingleStock.resource.count,
    };

    context.res = {
      body: singleProduct,
    };
  } catch (err) {
    context.res = {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 400,
      body: {
        error: err.message,
      },
      isRaw: true,
    };
  }
};

export default httpTrigger;
