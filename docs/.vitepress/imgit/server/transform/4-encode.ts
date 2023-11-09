import { ProbedAsset, EncodedAsset } from "../asset";

/** Creates optimized versions of the source asset files. */
export async function encode(path: string, assets: ProbedAsset[]): Promise<EncodedAsset[]> {
    return assets.map(a => ({ ...a, encodedPath: "" }));
}
