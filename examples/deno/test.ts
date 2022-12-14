// @deno-types="../../build/index.d.ts"
import {Gofetch} from '../../build/index.mjs';
// @deno-types="../../build/common/types.d.ts"
import type {Middleware, RequestConfig} from '../../build/common/types.d.ts';

const gofetch = new Gofetch(new URL('http://localhost:8080/'));

class AuthMiddleware implements Middleware {
    private authToken: string | null = null;
    private authURL = new URL('http://localhost:8080/login');
    private authenticating = false;

    async onRequest(config: RequestConfig) {
        if (this.authenticating) return config; // prevent infinite loop
        if (!this.authToken) {
            // get auth token
            this.authenticating = true;
            const response = await gofetch.get(this.authURL);
            this.authToken = await response.text();
        }

        this.authenticating = false;

        return {
            headers: {
                Authorization: `Bearer ${this.authToken}`
            }
        }
    }
}

gofetch.use(new AuthMiddleware());

interface Payload {
    messagePayload: string;
}

gofetch.get()
.then(res => res.json<Payload>())
.then(json => json.messagePayload)
.then(console.log)
.catch(console.error);

