import { Injectable } from "@nestjs/common";
import { DockerSandbox } from "./docker-sandbox";
import { v4 as uuidv4 } from "uuid";
import { compilerArray } from "./compilers";
import path from "path";

@Injectable()
export class CodeRunnerService {
  path = path.resolve("./"); //current working path
  vm_name = "virtual_machine"; //name of virtual machine that we want to execute
  timeout_value = 20; //Timeout Value, In Seconds

  async execute(code: string, stdin: string = "", language = 4) {
    //folder in which the temporary folder will be saved
    const folder = "temp/" + uuidv4();

    const sandboxType = new DockerSandbox(
      this.timeout_value,
      this.path,
      folder,
      this.vm_name,
      compilerArray[language][0],
      compilerArray[language][1],
      code,
      compilerArray[language][2],
      compilerArray[language][3],
      compilerArray[language][4],
      stdin
    );

    //data will contain the output of the compiled/interpreted code
    //the result maybe normal program output, list of error messages or a Timeout error
    return await sandboxType.run();
  }
}
