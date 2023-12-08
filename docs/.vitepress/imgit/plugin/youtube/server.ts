import { Plugin } from "../../server";
import { BuiltAsset, ResolvedAsset } from "../../server/asset";
import { Cache, cache, std, cfg, defaults } from "../../server";

/** YouTube plugin preferences. */
export type Prefs = {
    /** Whether to show captured alt syntax as video title; enabled by default. */
    title?: boolean;
    /** Whether to show "Watch on YouTube" banner; enabled by default. */
    banner?: boolean;
}

type YouTubeCache = Cache & {
    /** Resolved thumbnail URLs mapped by YouTube video ID. */
    youtube: Record<string, string>;
}

/** YouTube thumbnail variants; each video is supposed to have at least "0". */
const thumbs = ["maxresdefault", "mqdefault", "0"];
let pluginPrefs: Prefs | undefined;

/** Allows embedding YouTube videos with imgit.
 *  @example ![](https://www.youtube.com/watch?v=arbuYnJoLtU) */
export default function (prefs?: Prefs): Plugin {
    if (!cache.hasOwnProperty("youtube")) cache.youtube = {};
    pluginPrefs = prefs;
    return {
        resolvers: [resolveYouTubeAsset],
        builders: [buildYouTubeHtml]
    };
};

async function resolveYouTubeAsset(asset: ResolvedAsset): Promise<boolean> {
    if (!isYouTube(asset.syntax.url)) return false;
    const id = getYouTubeId(asset.syntax.url);
    asset.content = { src: await resolveThumbnailUrl(id) };
    return true;
}

async function buildYouTubeHtml(asset: BuiltAsset): Promise<boolean> {
    if (!isYouTube(asset.syntax.url)) return false;
    const id = getYouTubeId(asset.syntax.url);
    const source = `https://www.youtube-nocookie.com/embed/${id}`;
    const title = pluginPrefs?.title !== false
        ? `<div class="imgit-youtube-title">${asset.syntax.alt}</div>` : ``;
    const banner = pluginPrefs?.banner !== false
        ? `<button class="imgit-youtube-banner" title="Watch video on YouTube">Watch on</button>` : ``;
    asset.html = `
<div class="imgit-youtube" data-imgit-container>${title}${banner}
    <div class="imgit-youtube-poster" title="Play YouTube video">
        <button class="imgit-youtube-play" title="Play YouTube video"/>
        ${await buildPosterHtml(asset)}
    </div>
    <div class="imgit-youtube-player" hidden>
        <iframe title="${asset.syntax.alt}" data-imgit-src="${source}" allowfullscreen></iframe>
    </div>
</div>`;
    return true;
}

async function buildPosterHtml(asset: BuiltAsset): Promise<string> {
    // Pretend the asset is an image to re-use default picture build procedure.
    asset = { ...asset, syntax: { ...asset.syntax, url: "" } };
    await defaults.transform.build([asset]);
    return asset.html;
}

/** Whether specified url is a valid YouTube video link. */
function isYouTube(url: string): boolean {
    return url.includes("youtube.com/watch?v=");
}

/** Given valid url to a YouTube video, extracts video ID. */
function getYouTubeId(url: string): string {
    return new URL(url).searchParams.get("v")!;
}

async function resolveThumbnailUrl(id: string): Promise<string> {
    if ((<YouTubeCache>cache).youtube.hasOwnProperty(id))
        return (<YouTubeCache>cache).youtube[id];
    let response: Response = <never>null;
    for (const variant of thumbs)
        if ((response = await std.fetch(buildThumbnailUrl(id, variant))).ok) break;
    if (!response.ok) cfg.log?.warn?.(`Failed to resolve thumbnail for "${id}" YouTube video.`);
    else (<YouTubeCache>cache).youtube[id] = response.url;
    return response.url;
}

function buildThumbnailUrl(id: string, variant: string): string {
    return `https://i.ytimg.com/vi_webp/${id}/${variant}.webp`;
}
