/* eslint-disable import/first */
require('dotenv').config();

import { bootstrapAPI } from "./server";

console.log("Environment:", process.env.CURRENT_ENV);

bootstrapAPI();
