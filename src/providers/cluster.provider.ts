import { Injectable } from "@nestjs/common";
import cluster from "cluster";
import os from "os";

const numCPUs = process.env.CLUSTER ? Number(process.env.CLUSTER) : os.cpus().length;

@Injectable()
export class ClusterProvider {
  static clusterize(callback: Function): void {
    if (cluster.isMaster && (process.env.NODE_ENV === "production" || !!process.env.CLUSTER)) {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);

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