import { URL } from 'url';

import { IHttpContext, IPeer } from '../interfaces';

const safeUri = (url) => {
  try {
    return new URL(url);
    // eslint-disable-next-line no-empty
  } catch { }
  return null;
};
const isValidUrl = (url) => safeUri(url) != null;

export class Peer implements IPeer {
  uri: URL;
  constructor(public url: string, public isSelf = false) {
    url = (url || '').toLowerCase().trim();
    if (!url.startsWith('http')) {
      url = 'http://' + url;
    }
    this.url = url;
    this.uri = safeUri(url);
  }
}
export class PeerCollection {
  private peers: Peer[] = [];
  public self: Peer;
  constructor(urls?: string | string[]) {
    if (urls) this.add(urls);
  }
  public setSelf(url: string) {
    this.self = new Peer(url);
  }

  private _add(url: string) {
    url = (url || '').toLowerCase().trim();
    if (!url.startsWith('http')) {
      url = 'http://' + url;
    }
    if (isValidUrl(url) && this.peers.find((x) => x.url == url) == null) {
      this.peers.push(new Peer(url, url === this.self?.url));
    }
  }
  get length(): number {
    return this.peers.length;
  }
  add(url: string | string[] | PeerCollection): PeerCollection {
    const _urls: string[] = Array.isArray(url)
      ? url
      : url instanceof PeerCollection
        ? url.toString().split(',')
        : url.split(',');
    _urls.map((x) => this._add(x));
    return this;
  }
  getPeer(ctx: IHttpContext): Peer {
    ctx;
    let result: Peer = null;
    const chain = ctx.request.headers['x-forward-chain'] || '';
    const isValid = (_url: string) => {
      return _url != this.self?.url && chain.indexOf(_url) < 0;
    };
    for (let i = 0; i < this.peers.length; i++) {
      if (isValid(this.peers[i].url)) {
        result = this.peers[i];
        break;
      }
    }
    return result;
    return this.peers.length > 0 ? this.peers[0] : null;
  }
  toString(): string {
    let result = '';
    this.peers.map((x, i) => (result += (i > 0 ? ',' : '') + x.url));
    return result;
  }
}
