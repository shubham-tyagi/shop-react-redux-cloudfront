import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import uploadSingleProductToDb from '../utils/upload-single-product-to-db';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    context.log('HTTP trigger function processed a request.');
    const singleProduct = await uploadSingleProductToDb(req.body.title, req.body.description, req.body.price, req.body.count);
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
