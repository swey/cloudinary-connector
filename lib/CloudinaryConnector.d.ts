import { Transformation as CloudinaryTransformation } from 'cloudinary-core';
export interface BreakpointConfig {
    minWidth: number;
    maxWidth: number;
    minBreakpointSizeDiffKB: number;
    maxBreakpoints: number;
    list?: any[];
}
export interface Breakpoint {
    src: string;
    width: number;
    height?: number;
}
export interface AssetInfoInput {
    width: number;
    height: number;
    bytes: number;
}
export interface AssetInfoOutput extends AssetInfoInput {
    format: string;
}
export interface AssetInfoResize {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    x_factor?: number;
    y_factor?: number;
}
export interface AssetInfo {
    input: AssetInfoInput;
    resize?: AssetInfoResize[];
    output: AssetInfoOutput;
}
export default class CloudinaryConnector {
    private static BASE_OPTIONS_DEFAULTS;
    private static BREAKPOINT_CONFIG_DEFAULTS;
    private static TRANSFORMATION_DEFAULTS;
    static MAX_PIXEL: number;
    private _baseOptions;
    private _breakpointConfig;
    private _transformationDefaults;
    constructor(cloudName: string, baseConfig?: CloudinaryTransformation.Options);
    /**
     *
     * @param {Object} options
     */
    updateBaseOptions(options: CloudinaryTransformation.Options): void;
    /**
     *
     */
    getBaseOptions(): CloudinaryTransformation.Options;
    /**
     *
     * @param {Object} config
     */
    updateBreakpointConfig(config: BreakpointConfig): void;
    /**
     *
     */
    getBreakpointConfig(): BreakpointConfig;
    /**
     *
     * @param {Object} defaults
     */
    updateTransformationDefaults(defaults: CloudinaryTransformation.Options): void;
    /**
     *
     */
    getInfo(assetId: string, transformation?: CloudinaryTransformation | CloudinaryTransformation.Options): Promise<AssetInfo>;
    /**
     *
     * @param {String} imageUrl
     * @param {Object|Array} options
     */
    getSrcSet(imageUrl: string, transformation?: CloudinaryTransformation | CloudinaryTransformation.Options, breakpointConfig?: BreakpointConfig): Promise<Breakpoint[]>;
    private getTransformationChain;
    /**
     *
     * @param {String} imageUrl
     * @param {Array} transformation
     * @param {Object} [breakpointConfig]
     * @returns {Promise<Array>}
     */
    private getBreakpoints;
}
