import cloudinary from 'cloudinary';
import axios from 'axios';

export default class CloudinaryConnector {
	static BASE_CONFIG_DEFAULTS = {
		type: 'fetch',
		secure: true
	};

	static BREAKPOINT_CONFIG_DEFAULTS = {
		minWidth: 320,
		maxWidth: 4000,
		minBreakpointSizeDiffKB: 25,
		maxBreakpoints: 6
	};

	static TRANSFORMATION_DEFAULTS = {
		crop: 'fill',
		fetch_format: 'auto'
	};

	static MAX_PIXEL = 25 * 1000 * 1000;

	constructor(cloudName, baseConfig = {}) {
		cloudinary.config({
			cloud_name: cloudName
		});

		// Make sure the default objects for the settings/defaults cannot be overwritten
		Object.freeze(CloudinaryConnector.BASE_CONFIG_DEFAULTS);
		Object.freeze(CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
		Object.freeze(CloudinaryConnector.TRANSFORMATION_DEFAULTS);

		this._baseConfig = { ...CloudinaryConnector.BASE_CONFIG_DEFAULTS, baseConfig };
		this._breakpointConfig = { ...CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS };
		this._transformationDefaults = { ...CloudinaryConnector.TRANSFORMATION_DEFAULTS };
	}

	/**
	 *
	 * @param {Object} config
	 */
	updateBaseConfig(config) {
		this._baseConfig = { ...this._baseConfig, ...config };
	}

	/**
	 *
	 * @returns {{type: string, secure: boolean, baseConfig}|*}
	 */
	getBaseConfig() {
		return this._baseConfig;
	}

	/**
	 *
	 * @param {Object} config
	 */
	updateBreakpointConfig(config) {
		this._breakpointConfig = { ...this._breakpointConfig, ...config };
	}

	/**
	 *
	 * @returns {{minBreakpointSizeDiffKB: number, maxBreakpoints: number, minWidth: number, maxWidth: number}|*}
	 */
	getBreakpointConfig() {
		return this._breakpointConfig;
	}

	/**
	 *
	 * @param {Object} defaults
	 */
	updateTransformationDefaults(defaults) {
		this._transformationDefaults = { ...this._transformationDefaults, ...defaults };
	}

	/**
	 *
	 * @param {String} imageUrl
	 * @param {Object|Array} options
	 * @returns {Promise<{src: *, width: *, height: *}[]>}
	 */
	async getSrcSet(imageUrl, options = {}) {
		let transformation = options.transformation || options;

		if (!Array.isArray(transformation)) {
			transformation = [transformation];
		}

		// Append transformation defaults for the first transformation
		transformation[0] = { ...this._transformationDefaults, ...transformation[0] };

		// Aspect Ratio Handling
		transformation.map(transformationItem => {
			/* eslint-disable no-param-reassign */
			if (transformationItem.aspectRatio) {
				transformationItem.aspect_ratio = transformationItem.aspectRatio.replace(/x/, ':');
				delete transformationItem.aspectRatio;
			}
			/* eslint-enable no-param-reassign */

			return transformationItem;
		});

		let breakpoints;

		try {
			breakpoints = await this.getBreakpoints(imageUrl, transformation, options.breakpointConfig);
		} catch (error) {
			// Catch the error and continue without breakpoints
			console.error(error.message);
			breakpoints = ['auto'];
		}

		return breakpoints.map(breakpoint => {
			transformation[0].width = breakpoint;

			return {
				src: cloudinary.url(imageUrl, { ...this._baseConfig, transformation }),
				width: breakpoint,
				height: null
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
	async getBreakpoints(imageUrl, transformation, breakpointConfig = null) {
		const {
			minWidth, maxWidth, minBreakpointSizeDiffKB, maxBreakpoints, list: breakpointList
		} = (breakpointConfig ? { ...this._breakpointConfig, ...breakpointConfig } : this._breakpointConfig);

		// If a "list" is given in the breakpoint config, use that list instead of calculate one.
		if (breakpointList && breakpointList.length) {
			return breakpointList;
		}

		// Don't calculate breakpoints if max width is below the smallest wanted breakpoint
		if (maxWidth <= minWidth) {
			return [maxWidth];
		}

		const breakpointTransformation = [...transformation, {
			width: `auto:breakpoints_${minWidth}_${maxWidth}_${minBreakpointSizeDiffKB}_${maxBreakpoints}:json`
		}];

		const breakpointUrl = cloudinary.url(imageUrl, { ...this._baseConfig, transformation: breakpointTransformation });

		try {
			const response = await axios.get(breakpointUrl);

			return response.data.breakpoints;
		} catch (error) {
			const errorReason = error.response.headers['x-cld-error'];

			throw new Error(`[CloudinaryConnector] Error calculating breakpoints for ${imageUrl}\n${breakpointUrl}\n${errorReason}`);
		}
	}
}
