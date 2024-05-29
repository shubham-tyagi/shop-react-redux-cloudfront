import { Product, ProductWithStock, Stock } from '../types';
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

const uploadSingleProductToDb = async (title, description, price, count) => {

  if (!title || !description || !price || !count) {
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

  const responseSingleProduct = await containerProducts.items.upsert<Product>({
    id: uniqueProductId,
    title: title,
    description: description,
    price: price,
  });

  const responseSingleStock = await containerStocks.items.upsert<Stock>({
    product_id: uniqueProductId,
    count: count,
  });

  const singleProduct: ProductWithStock = {
    id: responseSingleProduct.resource.id,
    title: responseSingleProduct.resource.title,
    description: responseSingleProduct.resource.description,
    price: responseSingleProduct.resource.price,
    count: responseSingleStock.resource.count,
  };
  return singleProduct;
};

export default uploadSingleProductToDb;
