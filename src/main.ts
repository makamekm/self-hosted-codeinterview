/* eslint-disable import/first */
require('dotenv').config();

import { bootstrapAPI } from "./server";
import { ClusterProvider } from "./providers/cluster.provider";

console.log("Environment:", process.env.CURRENT_ENV);

ClusterProvider.clusterize(bootstrapAPI);
