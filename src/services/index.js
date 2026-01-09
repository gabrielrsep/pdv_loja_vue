import { registerAuthHandlers } from './auth.service.js';
import { registerConfigHandlers } from './config.service.js';
import { registerCustomerHandlers } from './customer.service.js';
import { registerFinancialHandlers } from './financial.service.js';
import { registerProductHandlers } from './product.service.js';
import { registerSalesHandlers } from './sales.service.js';
import { registerStatsHandlers } from './stats.service.js';
import { registerCategoryHandlers } from './category.service.js';
import { registerPromotionHandlers } from './promotion.service.js';
import { registerUpdateHandlers } from './update.service.js';

export const registerAllHandlers = (db) => {
    registerAuthHandlers(db);
    registerConfigHandlers(db);
    registerCustomerHandlers(db);
    registerFinancialHandlers(db);
    registerProductHandlers(db);
    registerSalesHandlers(db);
    registerStatsHandlers(db);
    registerCategoryHandlers(db);
    registerPromotionHandlers(db);
    registerUpdateHandlers();
};
