import cloudinary from 'cloudinary';
import axios from 'axios';

export interface BaseConfig {
	type?: 'fetch' | 'upload',
	secure?: boolean
};

export interface BreakpointConfig {
	minWidth: number,
	maxWidth: number,
	minBreakpointSizeDiffKB: number,
	maxBreakpoints: number,
	list?: any[]
};

export interface Breakpoint {
	src: string
	width: number,
	height?: number
}


export default class CloudinaryConnector {
	private static BASE_CONFIG_DEFAULTS: BaseConfig = {
		type: 'fetch',
		secure: true
	};

	private static BREAKPOINT_CONFIG_DEFAULTS: BreakpointConfig = {
		minWidth: 320,
		maxWidth: 4000,
		minBreakpointSizeDiffKB: 25,
		maxBreakpoints: 6
	};

	private static TRANSFORMATION_DEFAULTS: Record<string, any> = {
		crop: 'fill',
		fetch_format: 'auto'
	};

	static MAX_PIXEL = 25 * 1000 * 1000;

	private _baseConfig: BaseConfig;

	private _breakpointConfig: BreakpointConfig;

	private _transformationDefaults: Record<string, any>;

	constructor(cloudName: string, baseConfig: BaseConfig = {}) {
		cloudinary.config({
			cloud_name: cloudName
		});

		// Make sure the default objects for the settings/defaults cannot be overwritten
		Object.freeze(CloudinaryConnector.BASE_CONFIG_DEFAULTS);
		Object.freeze(CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
		Object.freeze(CloudinaryConnector.TRANSFORMATION_DEFAULTS);

		this._baseConfig = { ...CloudinaryConnector.BASE_CONFIG_DEFAULTS, ...baseConfig };
		this._breakpointConfig = { ...CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS };
		this._transformationDefaults = { ...CloudinaryConnector.TRANSFORMATION_DEFAULTS };
	}

	/**
	 *
	 * @param {Object} config
	 */
	public updateBaseConfig(config: BaseConfig): void {
		this._baseConfig = { ...this._baseConfig, ...config };
	}

	/**
	 *
	 * @returns {{type: string, secure: boolean, baseConfig}|*}
	 */
	public getBaseConfig(): BaseConfig {
		return this._baseConfig;
	}

	/**
	 *
	 * @param {Object} config
	 */
	public updateBreakpointConfig(config: BreakpointConfig): void {
		this._breakpointConfig = { ...this._breakpointConfig, ...config };
	}

	/**
	 *
	 * @returns {{minBreakpointSizeDiffKB: number, maxBreakpoints: number, minWidth: number, maxWidth: number}|*}
	 */
	public getBreakpointConfig(): BreakpointConfig {
		return this._breakpointConfig;
	}

	/**
	 *
	 * @param {Object} defaults
	 */
	public updateTransformationDefaults(defaults: Record<string, any>): void {
		this._transformationDefaults = { ...this._transformationDefaults, ...defaults };
	}

	/**
	 *
	 * @param {String} imageUrl
	 * @param {Object|Array} options
	 * @returns {Promise<{src: *, width: *, height: *}[]>}
	 */
	public async getSrcSet(imageUrl: string, options: Record<string, any> = {}): Promise<Breakpoint[]> {
		let transformation = options.transformation || options;

		if (!Array.isArray(transformation)) {
			transformation = [transformation];
		}

		// Append transformation defaults for the first transformation
		transformation[0] = { ...this._transformationDefaults, ...transformation[0] };

		// Aspect Ratio Handling
		transformation.map((transformationItem: Record<string, any>): Record<string, any> => {
			/* eslint-disable no-param-reassign */
			if (transformationItem.aspectRatio) {
				transformationItem.aspect_ratio = transformationItem.aspectRatio.replace(/x/, ':');
				delete transformationItem.aspectRatio;
			}
			/* eslint-enable no-param-reassign */

			return transformationItem;
		});

		let breakpoints: number[];

		try {
			breakpoints = await this.getBreakpoints(imageUrl, transformation, options.breakpointConfig);
		} catch (error) {
			// Catch the error and continue without calculated breakpoints
			console.error(error.message);
			const breakpointConfig: BreakpointConfig = { ...this._breakpointConfig, ...options.breakpointConfig };
			breakpoints = [breakpointConfig.minWidth, breakpointConfig.minWidth / 2 + breakpointConfig.maxWidth / 2, breakpointConfig.maxWidth];
		}

		return breakpoints.map((breakpoint: number): Breakpoint => {
			transformation[0].width = breakpoint;

			return {
				src: cloudinary.url(imageUrl, { ...this._baseConfig, transformation }),
				width: breakpoint,
			};
		});
	}


	/**
	 *
	 * @param {String} imageUrl
	 * @param {Array} transformation
	 * @param {Object} [breakpointConfig]
	 * @returns {Promise<Array>}
	 */
	private async getBreakpoints(imageUrl: string, transformation: any[], breakpointConfig?: BreakpointConfig): Promise<number[]> {
		const _breakpointConfig: BreakpointConfig = { ...this._breakpointConfig, ...breakpointConfig };

		// If a "list" is given in the breakpoint config, use that list instead of calculating one.
		if (_breakpointConfig.list && _breakpointConfig.list.length) {
			return _breakpointConfig.list;
		}

		// Don't calculate breakpoints if max width is below the smallest wanted breakpoint
		if (_breakpointConfig.maxWidth <= _breakpointConfig.minWidth) {
			return [_breakpointConfig.maxWidth];
		}

		const breakpointTransformation: Record<string, any>[] = [...transformation, {
			width: `auto:breakpoints_${_breakpointConfig.minWidth}_${_breakpointConfig.maxWidth}_${_breakpointConfig.minBreakpointSizeDiffKB}_${_breakpointConfig.maxBreakpoints}:json`
		}];

		const breakpointUrl: string = cloudinary.url(imageUrl, { ...this._baseConfig, transformation: breakpointTransformation });

		try {
			const response: any = await axios.get(breakpointUrl);

			return response.data.breakpoints as number[];
		} catch (error) {
			const errorReason = error.response.headers['x-cld-error'];

			throw new Error(`[CloudinaryConnector] Error calculating breakpoints for ${imageUrl}\n${breakpointUrl}\n${errorReason}`);
		}
	}
}
