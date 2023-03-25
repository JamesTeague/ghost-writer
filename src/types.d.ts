import {Subscription} from "rxjs";

export type PodcastItem = {
    id: string;
    title: string;
    description: string;
    published: number;
    created: number;
    category: string[]
    content: string;
    enclosures: Enclosure[],
    content_encoded: string;
    itunes_duration: number;
    itunes_season: number;
    itunes_episode: number;
    itunes_episodeType: string;
    media: object;
}

export type Enclosure = {
    url: string;
    length: string;
    type: string;
}

export type Feed = {
    title: string;
    description: string;
    link: string;
    image: string;
    category: string[];
    items: PodcastItem[]
}
export type Post = {
    tags: any[],
    id: string,
    published_at: string,
}

export type PublishRequest = {
    showLink: string,
    item: PodcastItem,
    tags?: string[],
}

export type WatchRequest = {
    frequencyMs: number
    rssFeed: string
}

export interface Watcher {
    watch(request: WatchRequest): Promise<Subscription>
}

export type DeleteAllRequest = {
    tags?: string[],
}

export interface Publisher {
    publish(request: PublishRequest): Promise<void>;
    deleteAll(request: DeleteAllRequest): Promise<void>;
}
export type Action = (...args: any[]) => void | Promise<void>