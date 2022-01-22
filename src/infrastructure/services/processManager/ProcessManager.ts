import { ChildProcess, exec, spawn, SpawnOptions } from "child_process";
import find from "find-process";
import { IEnumerable } from "linq";
import { baseUtils } from "../../base";

import { IProcess, IProcessManager, ProcessInfo } from "./IProcessManager";


export class ProcessManager implements IProcessManager {

    private _processes: IProcess[] = [];
    create(name: string): IProcess {
        var result = new Process(name);
        this._processes.push(result);
        return result;
    }
    async findByName(name: string): Promise<ProcessInfo[]> {
        var lst = await find('name', name);
        return lst;
    }
    async findByPort(port: number): Promise<ProcessInfo[]> {
        var lst = await find('port', port.toString());
        return lst;
    }
    async findByPid(pid: number): Promise<ProcessInfo[]> {
        var lst = await find('pid', pid.toString());
        return lst;
    }
    getChilds(): IEnumerable<IProcess> {
        return baseUtils.from(this._processes);
    }


}
export class Process implements IProcess {
    public process: ChildProcess
    public stderror: string;
    public stdout: string;
    private _onExit: (code: number) => void = null;
    constructor(public name: string) {
    }
    isExited(): boolean {
        return this.process && (this.process.exitCode != null);
    }
    onExit(callBack: (code: number) => void) {
        this._onExit = callBack;
        return this as IProcess;

    }
    get file(): string {
        return this.process.spawnfile;
    }
    spawn(cmd: string, args: string[], options: SpawnOptions = null) {
        this.process = spawn(cmd, args, options);
        this.process.stdout.on('data', data => {
            this.stdout = (this.stdout || '') + data.toString();
        })
        this.process.stderr.on('data', (err) => {
            this.stderror = (this.stderror || '') + `${err}`;

        });
        this.process.on('exit', c => {
            if (this._onExit)
                this._onExit(c);

        });
        return this;
    }

    public exec(cmd: string): Promise<IProcess> {
        return new Promise<IProcess>((resolve, reject) => {
            this.process = exec(cmd, (err, _stdout, _stderror) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.stdout = _stdout;
                this.stderror = _stderror;
                resolve(this);
            })
        });


    }
}