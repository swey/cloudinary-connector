export interface BaseConfig {
    type?: 'fetch' | 'upload';
    secure?: boolean;
}
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
export default class CloudinaryConnector {
    private static BASE_CONFIG_DEFAULTS;
    private static BREAKPOINT_CONFIG_DEFAULTS;
    private static TRANSFORMATION_DEFAULTS;
    static MAX_PIXEL: number;
    private _baseConfig;
    private _breakpointConfig;
    private _transformationDefaults;
    constructor(cloudName: string, baseConfig?: BaseConfig);
    /**
     *
     * @param {Object} config
     */
    updateBaseConfig(config: BaseConfig): void;
    /**
     *
     * @returns {{type: string, secure: boolean, baseConfig}|*}
     */
    getBaseConfig(): BaseConfig;
    /**
     *
     * @param {Object} config
     */
    updateBreakpointConfig(config: BreakpointConfig): void;
    /**
     *
     * @returns {{minBreakpointSizeDiffKB: number, maxBreakpoints: number, minWidth: number, maxWidth: number}|*}
     */
    getBreakpointConfig(): BreakpointConfig;
    /**
     *
     * @param {Object} defaults
     */
    updateTransformationDefaults(defaults: Record<string, any>): void;
    /**
     *
     * @param {String} imageUrl
     * @param {Object|Array} options
     * @returns {Promise<{src: *, width: *, height: *}[]>}
     */
    getSrcSet(imageUrl: string, options?: Record<string, any>): Promise<Breakpoint[]>;
    /**
     *
     * @param {String} imageUrl
     * @param {Array} transformation
     * @param {Object} [breakpointConfig]
     * @returns {Promise<Array>}
     */
    private getBreakpoints;
}
