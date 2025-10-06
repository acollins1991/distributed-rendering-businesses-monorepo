import createUserFactory from './User';
import ApiRequestFactory from './ApiRequest';
import type { Site } from '../entities/site';

export default async function createSite() {
    const { session } = await createUserFactory()
    const res = await new ApiRequestFactory('sites', {
        name: 'Testing site'
    }).post.setAuthSession(session.id).go()

    // cloudflare handler handles differently
    if( res.json ) {
        return res.json() as Site
    } else {
        return JSON.parse(res.body) as Site
    }
} 