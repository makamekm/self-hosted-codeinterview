import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { spawn, exec } from "child_process";
import { makeHotPromise } from "./hot-promise.util";

@Injectable()
export class CodeRunnerService {
  path = path.resolve("./"); //current working path
  vm_name = "node"; //name of virtual machine that we want to execute
  timeout_value = 10; //Timeout Value, In Seconds

  async spawn(
    onData: (data: string, error: string, fullData: string) => void,
    onExit: (code: number, fullData: string) => void
  ) {
    const folder = "temp/" + uuidv4();
    const pwd = path.resolve(this.path, folder);

    await this.prepareFolder(pwd);

    let scriptOutput = "";
    const child = spawn("docker", [
      `run`,
      `--rm`,
      `-it`,
      `-v`,
      `"${pwd}":/data`,
      `-w`,
      `/data`,
      `node`,
      `bash`,
    ]);
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      chunk = chunk.toString();
      scriptOutput += chunk;
      onData(chunk, null, scriptOutput);
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      chunk = chunk.toString();
      scriptOutput += chunk;
      onData(null, chunk, scriptOutput);
    });
    child.on("close", async (code) => {
      await this.clean(pwd);
      onExit(code, scriptOutput);
    });
    const send = async (data) => {
      return new Promise<void>((r, e) => {
        child.stdin.write(data, (error) => {
          if (error) {
            e(error);
          } else {
            child.stdin.end((error) => {
              if (error) {
                e(error);
              } else {
                r(data);
              }
            });
          }
        });
      });
    };
    return { child, pwd: pwd, send };
  }

  async execute(code: string) {
    const hotPromise = makeHotPromise<{
      data: string;
      err: string;
      code: number;
    }>();
    const folder = "temp/" + uuidv4();
    const fileName = "file.js";
    const pwd = path.resolve(this.path, folder);

    await this.prepare(code, pwd, fileName);

    let data = "";
    let err = "";

    const child = spawn(
      "sudo",
      [
        "sh",
        path.resolve("./DockerRunWithTimeout.sh"),
        `${this.timeout_value}`,
        `${pwd}`,
        "node", // image
        "node", // compilator
        `${fileName}`,
      ],
      {
        shell: "/bin/sh",
      }
    );
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      chunk = chunk.toString();
      data += chunk;
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      chunk = chunk.toString();
      err += chunk;
    });
    child.on("close", (code) => {
      hotPromise.resolve({
        data,
        err,
        code,
      });
    });
    let result = await hotPromise.promise;
    await this.clean(pwd);
    return result;
  }

  prepare(code: string, folder: string, fileName: string) {
    const filePath = path.resolve(folder, fileName);
    return new Promise<void>((r, e) =>
      exec(`mkdir -p ${folder} && chmod 777 ${folder}`, (exception) => {
        if (exception) {
          e(exception);
        } else
          fs.writeFile(filePath, code, (err) => {
            if (err) {
              e(err);
            } else {
              exec(`chmod 777 '${filePath}'`, (err) => {
                if (err) {
                  e(err);
                } else {
                  r();
                }
              });
            }
          });
      })
    );
  }

  prepareFolder(folder: string) {
    return new Promise<void>((r, e) =>
      exec(`mkdir -p ${folder} && chmod 777 ${folder}`, (exception) => {
        if (exception) {
          e(exception);
        } else {
          r();
        }
      })
    );
  }

  clean(folder: string) {
    return new Promise<void>((r, e) =>
      exec(`rm -rf ${folder}`, (exception) => {
        if (exception) {
          e(exception);
        } else {
          r();
        }
      })
    );
  }
}
