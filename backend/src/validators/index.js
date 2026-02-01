/**
 * Validators Index - Export all validators
 */

const authValidator = require('./authValidator');
const staffValidator = require('./staffValidator');
const profileValidator = require('./profileValidator');
const productValidator = require('./productValidator');
const collectionValidator = require('./collectionValidator');
const orderValidator = require('./orderValidator');
const inventoryValidator = require('./inventoryValidator');
const catalogValidator = require('./catalogValidator');
const commonValidator = require('./commonValidator');
const customerValidator = require('./customerValidator');
const supplierValidator = require('./supplierValidator');
const discountValidator = require('./discountValidator');
const cashbookValidator = require('./cashbookValidator');
const shipmentValidator = require('./shipmentValidator');
const reportValidator = require('./reportValidator');
const posValidator = require('./posValidator');
const bankAccountValidator = require('./bankAccountValidator');
const checkoutValidator = require('./checkoutValidator');

module.exports = {
  ...authValidator,
  ...staffValidator,
  ...profileValidator,
  ...productValidator,
  ...collectionValidator,
  ...orderValidator,
  ...inventoryValidator,
  ...catalogValidator,
  ...commonValidator,
  ...customerValidator,
  ...supplierValidator,
  discountValidator,
  cashbookValidator,
  shipmentValidator,
  reportValidator,
  posValidator,
  bankAccountValidator,
  checkoutValidator,
};
