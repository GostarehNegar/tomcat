import { URL } from "url";

export class Peer {
    uri: URL;
    constructor(url: URL | string) {
        this.uri = typeof url == 'string' ? new URL(url) : url;
    }

}
export class PeerCollection {
    peers: Peer[] = [];

    add(url: string | URL) {
        this.peers.push(new Peer(url));
        return this;
    }


}