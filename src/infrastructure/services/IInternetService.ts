import { Agent } from 'node:https';



export interface IInternetService {
    getAgent(url?: string, max_trials?: number, dont_reject?: boolean, interval?: number, refersh?: boolean): Promise<Agent>;
}
