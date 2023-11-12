import { platform } from "./platform";
import { config } from "./config";
import { ensureDir } from "./common";
import { AssetSize } from "./asset";

export const cache = {
    size: {} as Record<string, AssetSize>
};

export async function load() {
    for (const prop of Object.getOwnPropertyNames(cache)) {
        const filepath = buildCacheFilePath(prop);
        if (await platform.fs.exists(filepath))
            (<Record<string, unknown>>cache)[prop] = read(filepath);
    }
}

export async function save() {
    ensureDir(config.cache);
    for (const prop of Object.getOwnPropertyNames(cache)) {
        const filepath = buildCacheFilePath(prop);
        await write(filepath, (<Record<string, unknown>>cache)[prop]);
    }
}

async function read(filepath: string) {
    return JSON.parse(await platform.fs.read(filepath));
}

function write(filepath: string, object: unknown) {
    return platform.fs.write(filepath, JSON.stringify(object));
}

function buildCacheFilePath(prop: string) {
    return platform.path.join(config.cache, `${prop}.json`);
}
