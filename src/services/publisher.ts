import { PublishRequest, DeleteAllRequest, PodcastItem, Post, Publisher } from "../types";
import {
    enclosedTitleForEmbed,
    extractBuzzsproutNumericalId,
    filterFooter, filterPostsByTag
} from "../utilities";


export const createPublisher = (client: any): Publisher => {
    return {
        publish: publish(client),
        deleteAll: deleteAll(client),
    }
}

const publish = (client: any) => async ({ showLink, item, tags }: PublishRequest) => {
    const html = createEmbed(showLink, item)

    return client.posts.add({
            title: item.title,
            html,
            custom_excerpt: filterFooter(item.description),
            published_at: new Date(item.published).toISOString(),
            tags: tags ? tags : [],
            feature_image: process.env.LOGO_URL,
            status: "published",
        },
        { source: 'html' })
}

const deleteAll = (client: any) => async ({ tags }: DeleteAllRequest) => {
    let posts = await client.posts.browse({ limit: 300 })
    let postsToDelete: Post[] = []

    if (tags && tags.length) {
        postsToDelete = tags.reduce((acc, tag) => {
            return acc.concat(...filterPostsByTag(posts, tag))
        }, [] as Post[])
    }

    await Promise
        .all(postsToDelete.map(({ id }) => {
            client.posts.delete({id})
        }))
}

const createEmbed = (showLink: string, { enclosures }: PodcastItem) => {
    const enclosure = enclosures.find(e => e.type === 'audio/mpeg')!
    const extractedId = extractBuzzsproutNumericalId(enclosure);
    const divId = `buzzsprout-player-${extractedId}`;
    const enclosedTitle = enclosedTitleForEmbed(enclosure)

    return `<!--kg-card-begin: html-->
            <div id="${divId}"></div><script src="${enclosedTitle}.js?container_id=${divId}&player=small" type="text/javascript" charset="utf-8"></script>
            <!--kg-card-end: html-->`;
}
