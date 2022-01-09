import { ChildProcess } from "child_process";
import { IEnumerable } from "linq";

export type ProcessInfo = {
    pid: number;
    ppid?: number;
    uid?: number;
    gid?: number;
    name: string;
    cmd: string;
};

export interface IProcessManager {
    create(name: string): IProcess;
    findByName(name: string): Promise<ProcessInfo[]>;
    findByPort(port: number): Promise<ProcessInfo[]>;
    findByPid(pid: number): Promise<ProcessInfo[]>;
    getChilds(): IEnumerable<IProcess>
}
/**
 * Represents a spawned child process .
 */
export interface IProcess {


    get process(): ChildProcess;
    get name(): string;
    get file(): string;
    exec(cmd: string): Promise<IProcess>;
    spawn(cmd: string, args: string[]): IProcess;
    onExit(callBack: (code: number) => void): IProcess;
    isExited(): boolean;

}