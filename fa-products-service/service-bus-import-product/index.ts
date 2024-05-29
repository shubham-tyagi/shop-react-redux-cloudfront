import { AzureFunction, Context } from '@azure/functions';
import uploadSingleProductToDb from '../utils/upload-single-product-to-db';

const serviceBusQueueTrigger: AzureFunction = async function (
  context: Context,
  mySbMsg: any
): Promise<void> {
  try {
    context.log('ServiceBus queue trigger function processed message', mySbMsg);
    const { title, description, price, count } = mySbMsg.product;
    await uploadSingleProductToDb(title, description, price, count);
  } catch (err) {
    context.log('Product not in correct format in the file', mySbMsg);
  }
};

export default serviceBusQueueTrigger;
