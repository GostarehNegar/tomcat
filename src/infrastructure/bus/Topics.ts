// import { IParsedTopic } from "./IParsedTopic";

// const delim = '://';
export default class SystemTopics {
  //public static Instance = new SystemTopics();
  public static reply = '#reply';
  public static reject = '#reject';
  public readonly reply = '#reply';
  /**
   * When a bus(node) goes down, (diconnects)
   * the WebSocketHub reports it with this ropic.
   */
  public static busdown = '#busdown';
  public static readonly Internal = {
    publish: 'publish',
    subscribe: 'subscribe',
    connect: 'connect',
    send: 'send',
    ping: 'ping',
    pong: 'pong'
  }
  public static isSystemTopic(topic: string): boolean {
    return topic === this.reply;
  }

}
//export default SystemTopics.Instance;
// export class MessageTopic implements IParsedTopic {
//   public static delim = delim;
//   public channel: string | null;
//   public topic: string;
//   constructor(topic: string, channel?: string) {
//     this.topic = topic;
//     this.channel = channel;
//   }
//   public toString() {
//     return `${this.channel || '*'}${delim}${this.topic || '*'}`;
//   }
//   // public static parse(input: string, defaultChannel?: string): MessageTopic {
//   //   if (!input) return null;
//   //   const tokens = input.split(delim);
//   //   if (tokens.length == 0) {
//   //     return null;
//   //   } else if (tokens.length == 1) {
//   //     return new MessageTopic(tokens[0], defaultChannel);
//   //   } else if (tokens.length == 2) {
//   //     return new MessageTopic(tokens[1], tokens[0]);
//   //   }
//   //   throw 'invalid topic';
//   // }
//   // public static parse3(input: string, defaultChannel?: string): IParsedTopic {
//   //   if (!input) return null;
//   //   const tokens = input.split(delim);
//   //   if (tokens.length == 0) {
//   //     return null;
//   //   } else if (tokens.length == 1) {
//   //     return { topic: tokens[0], channel: defaultChannel }; // {new MessageTopic(tokens[0], defaultChannel)}
//   //   } else if (tokens.length == 2) {
//   //     return { topic: tokens[1], channel: tokens[0] }; // new MessageTopic(tokens[1], tokens[0])
//   //   }
//   //   throw 'invalid topic';
//   // }
//   // public static parse2(): IParsedTopic {
//   //   return { topic: '', channel: null };
//   // }
//   public static reply = '#reply';
// }
// export class MessageTopicHelper {
//   public static reply = '#reply';
//   public static buildTopic(topic: string, user?: string, device?: string) {
//     return `${user || '*'}/${device || '*'}/${topic || '*'}`
//   }
// }
