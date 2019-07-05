import cloudinary from 'cloudinary';
import { Transformation as CloudinaryTransformation } from 'cloudinary-core';

import axios from 'axios';

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

export interface AssetInfoInput {
	width: number;
	height: number;
	bytes: number;
}

export interface AssetInfoOutput extends AssetInfoInput {
	format: string
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
	resize?: AssetInfoResize[]
	output: AssetInfoOutput;
}


export default class CloudinaryConnector {
	private static BASE_OPTIONS_DEFAULTS: CloudinaryTransformation.Options = {
		type: 'fetch',
		secure: true
	};

	private static BREAKPOINT_CONFIG_DEFAULTS: BreakpointConfig = {
		minWidth: 320,
		maxWidth: 4000,
		minBreakpointSizeDiffKB: 25,
		maxBreakpoints: 6
	};

	private static TRANSFORMATION_DEFAULTS: CloudinaryTransformation.Options = {
		crop: 'fill',
		fetch_format: 'auto'
	};

	static MAX_PIXEL = 25 * 1000 * 1000;

	private _baseOptions: CloudinaryTransformation.Options;

	private _breakpointConfig: BreakpointConfig;

	private _transformationDefaults: CloudinaryTransformation.Options;

	constructor(cloudName: string, baseConfig?: CloudinaryTransformation.Options) {
		cloudinary.config({
			cloud_name: cloudName
		});

		// Make sure the default objects for the settings/defaults cannot be overwritten
		Object.freeze(CloudinaryConnector.BASE_OPTIONS_DEFAULTS);
		Object.freeze(CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
		Object.freeze(CloudinaryConnector.TRANSFORMATION_DEFAULTS);

		this._baseOptions = { ...CloudinaryConnector.BASE_OPTIONS_DEFAULTS, ...baseConfig };
		this._breakpointConfig = { ...CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS };
		this._transformationDefaults = { ...CloudinaryConnector.TRANSFORMATION_DEFAULTS };
	}

	/**
	 *
	 * @param {Object} options
	 */
	public updateBaseOptions(options: CloudinaryTransformation.Options): void {
		this._baseOptions = { ...this._baseOptions, ...options };
	}

	/**
	 *
	 */
	public getBaseOptions(): CloudinaryTransformation.Options {
		return this._baseOptions;
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
	 */
	public getBreakpointConfig(): BreakpointConfig {
		return this._breakpointConfig;
	}

	/**
	 *
	 * @param {Object} defaults
	 */
	public updateTransformationDefaults(defaults: CloudinaryTransformation.Options): void {
		this._transformationDefaults = { ...this._transformationDefaults, ...defaults };
	}


	/**
	 *
	 */
	public async getInfo(assetId: string, transformation?: CloudinaryTransformation | CloudinaryTransformation.Options): Promise<AssetInfo> {

		let transformationChain: CloudinaryTransformation = this.getTransformationChain(transformation);

		transformationChain = transformationChain.chain();
		transformationChain.flags('getinfo');


		const cloudinaryUrl: string = cloudinary.url(assetId, { ...transformationChain.toOptions(), secure: true });

		try {
			const response: any = await axios.get(cloudinaryUrl);

			return response.data as AssetInfo;
		} catch (error) {
			console.log(error)
			const errorReason = error.response && error.response.headers ? error.response.headers['x-cld-error'] : error.message;

			throw new Error(`[CloudinaryConnector] Error getting info for ${assetId}\n${cloudinaryUrl}\n${errorReason}`);
		}
	}

	/**
	 *
	 * @param {String} imageUrl
	 * @param {Object|Array} options
	 */
	public async getSrcSet(imageUrl: string, transformation?: CloudinaryTransformation | CloudinaryTransformation.Options, breakpointConfig?: BreakpointConfig): Promise<Breakpoint[]> {
		const transformationChain: CloudinaryTransformation = this.getTransformationChain(transformation)

		/*
		// Can't see if and how the following was still being used

		// Aspect Ratio Handling
		transformation.map((transformationItem: Record<string, any>): Record<string, any> => {
			// eslint-disable no-param-reassign
			if (transformationItem.aspectRatio) {
				transformationItem.aspect_ratio = transformationItem.aspectRatio.replace(/x/, ':');
				delete transformationItem.aspectRatio;
			}
			// eslint-enable no-param-reassign

			return transformationItem;
		});

		*/

		let breakpoints: number[];

		try {
			breakpoints = await this.getBreakpoints(imageUrl, transformationChain, breakpointConfig);
		} catch (error) {
			// Catch the error and continue without calculated breakpoints
			console.error(error.message);
			const joinedBreakpointConfig: BreakpointConfig = { ...this._breakpointConfig, ...breakpointConfig };
			breakpoints = [joinedBreakpointConfig.minWidth, joinedBreakpointConfig.minWidth / 2 + joinedBreakpointConfig.maxWidth / 2, joinedBreakpointConfig.maxWidth];
		}

		return breakpoints.map((breakpoint: number): Breakpoint => {
			return {
				src: cloudinary.url(imageUrl, { ...transformationChain.toOptions(), width: breakpoint, secure: true }),
				width: breakpoint,
			};
		});
	}

	private getTransformationChain(transformation?: CloudinaryTransformation | CloudinaryTransformation.Options): CloudinaryTransformation {
		let transformationChain: CloudinaryTransformation = CloudinaryTransformation.new({ ...this._baseOptions, ...this._transformationDefaults});

		// apply custom transformation
		if (transformation) {
			transformationChain = CloudinaryTransformation.new({...transformationChain, ...((transformation.toOptions !== undefined)
				? transformation.toOptions()
				: transformation)});

		}
		return transformationChain;
	}


	/**
	 *
	 * @param {String} imageUrl
	 * @param {Array} transformation
	 * @param {Object} [breakpointConfig]
	 * @returns {Promise<Array>}
	 */
	private async getBreakpoints(imageUrl: string, transformation: CloudinaryTransformation, breakpointConfig?: BreakpointConfig): Promise<number[]> {
		const _breakpointConfig: BreakpointConfig = { ...this._breakpointConfig, ...breakpointConfig };

		// If a "list" is given in the breakpoint config, use that list instead of calculating one.
		if (_breakpointConfig.list && _breakpointConfig.list.length) {
			return _breakpointConfig.list;
		}

		// Don't calculate breakpoints if max width is below the smallest wanted breakpoint
		if (_breakpointConfig.maxWidth <= _breakpointConfig.minWidth) {
			return [_breakpointConfig.maxWidth];
		}


		const transformationChain: CloudinaryTransformation  = new CloudinaryTransformation(transformation.toOptions());
		transformationChain.width(`auto:breakpoints_${_breakpointConfig.minWidth}_${_breakpointConfig.maxWidth}_${_breakpointConfig.minBreakpointSizeDiffKB}_${_breakpointConfig.maxBreakpoints}:json`);

		const breakpointUrl: string = cloudinary.url(imageUrl, { ...transformationChain.toOptions(), secure: true });

		try {
			const response: any = await axios.get(breakpointUrl);
			return response.data.breakpoints as number[];
		} catch (error) {
			const errorReason = error.response.headers['x-cld-error'];

			throw new Error(`[CloudinaryConnector] Error calculating breakpoints for ${imageUrl}\n${breakpointUrl}\n${errorReason}`);
		}
	}
}
