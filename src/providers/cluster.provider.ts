import { Injectable } from "@nestjs/common";
import * as cluster from "cluster";
import * as os from "os";
import * as http from "http";
import { WEB_SERVER_PORT, WEB_SERVER_HOST } from "@env/config";
import { setupMaster } from "@socket.io/sticky";

const numCPUs = os.cpus().length;

@Injectable()
export class ClusterProvider {
  static clusterize(callback: Function): void {
    if (cluster.isMaster && process.env.NODE_ENV === "production") {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);

      const httpServer = http.createServer();
      setupMaster(httpServer, {
        loadBalancingMethod: "least-connection", // either "random", "round-robin" or "least-connection"
      });
      httpServer.listen(Number(WEB_SERVER_PORT), WEB_SERVER_HOST);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
      });
    } else {
      callback();
    }
  }
}