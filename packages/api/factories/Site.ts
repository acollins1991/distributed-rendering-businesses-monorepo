import createUserFactory from './User';
import ApiRequestFactory from './ApiRequest';
import type { Site } from '../entities/site';

export default async function createSite() {
    const { session } = await createUserFactory()
    const res = await new ApiRequestFactory('/api/sites', {
        name: 'Testing site'
    }).post.setAuthSession(session.id).go()
    const site = await res.json() as Site
    return site
} 