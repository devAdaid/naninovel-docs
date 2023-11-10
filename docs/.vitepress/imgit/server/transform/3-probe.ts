import { exec, ExecException } from "node:child_process";
import { config } from "../config";
import { cache } from "../cache";
import { DownloadedAsset, ProbedAsset, AssetSize, AssetType } from "../asset";

const probing = new Map<string, Promise<AssetSize>>;

/** Probes downloaded asset files to evaluate their width and height. */
export function probe(assets: DownloadedAsset[]): Promise<ProbedAsset[]> {
    return Promise.all(assets.map(probeAsset));
}

async function probeAsset(asset: DownloadedAsset): Promise<ProbedAsset> {
    let size: AssetSize;
    if (asset.type === AssetType.YouTube) size = { width: 0, height: 0 };
    else if (cache.size.hasOwnProperty(asset.sourcePath)) size = cache.size[asset.sourcePath];
    else if (probing.has(asset.sourcePath)) size = await probing.get(asset.sourcePath)!;
    else size = cache.size[asset.sourcePath] = await probeSize(asset.sourcePath);
    return { ...asset, size };
}

async function probeSize(filepath: string): Promise<AssetSize> {
    let resolve: (value: (AssetSize)) => void;
    probing.set(filepath, new Promise<AssetSize>(r => resolve = r));
    exec(`ffprobe ${config.probe.args} "${filepath}"`, (err, out) => handleProbe(resolve, err, out));
    return probing.get(filepath)!;
}

function handleProbe(resolve: (info: AssetSize) => void, error: (ExecException | null), out: string) {
    if (error) config.log?.err?.(`ffprobe error: ${error.message}`);
    resolve(parseOut(out));
}

function parseOut(out: string): AssetSize {
    if (!out?.includes("x")) return { width: NaN, height: NaN };
    const parts = out.split("x");
    return { width: Number(parts[0]), height: Number(parts[1]) };
}