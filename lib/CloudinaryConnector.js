"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CloudinaryConnector {
  constructor(cloudName, baseConfig = {}) {
    _cloudinary.default.config({
      cloud_name: cloudName
    }); // Make sure the default objects for the settings/defaults cannot be overwritten


    Object.freeze(CloudinaryConnector.BASE_CONFIG_DEFAULTS);
    Object.freeze(CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
    Object.freeze(CloudinaryConnector.TRANSFORMATION_DEFAULTS);
    this._baseConfig = _objectSpread({}, CloudinaryConnector.BASE_CONFIG_DEFAULTS, {
      baseConfig
    });
    this._breakpointConfig = _objectSpread({}, CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
    this._transformationDefaults = _objectSpread({}, CloudinaryConnector.TRANSFORMATION_DEFAULTS);
  }
  /**
   *
   * @param {Object} config
   */


  updateBaseConfig(config) {
    this._baseConfig = _objectSpread({}, this._baseConfig, config);
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
    this._breakpointConfig = _objectSpread({}, this._breakpointConfig, config);
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
    this._transformationDefaults = _objectSpread({}, this._transformationDefaults, defaults);
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
    } // Append transformation defaults for the first transformation


    transformation[0] = _objectSpread({}, this._transformationDefaults, transformation[0]); // Aspect Ratio Handling

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
      // Catch the error and continue without calculated breakpoints
      console.error(error.message);

      const {
        minWidth,
        maxWidth
      } = _objectSpread({}, this._breakpointConfig, options.breakpointConfig);

      breakpoints = [minWidth, minWidth / 2 + maxWidth / 2, maxWidth];
    }

    return breakpoints.map(breakpoint => {
      transformation[0].width = breakpoint;
      return {
        src: _cloudinary.default.url(imageUrl, _objectSpread({}, this._baseConfig, {
          transformation
        })),
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
      minWidth,
      maxWidth,
      minBreakpointSizeDiffKB,
      maxBreakpoints,
      list: breakpointList
    } = _objectSpread({}, this._breakpointConfig, breakpointConfig); // If a "list" is given in the breakpoint config, use that list instead of calculate one.


    if (breakpointList && breakpointList.length) {
      return breakpointList;
    } // Don't calculate breakpoints if max width is below the smallest wanted breakpoint


    if (maxWidth <= minWidth) {
      return [maxWidth];
    }

    const breakpointTransformation = [...transformation, {
      width: `auto:breakpoints_${minWidth}_${maxWidth}_${minBreakpointSizeDiffKB}_${maxBreakpoints}:json`
    }];

    const breakpointUrl = _cloudinary.default.url(imageUrl, _objectSpread({}, this._baseConfig, {
      transformation: breakpointTransformation
    }));

    try {
      const response = await _axios.default.get(breakpointUrl);
      return response.data.breakpoints;
    } catch (error) {
      const errorReason = error.response.headers['x-cld-error'];
      throw new Error(`[CloudinaryConnector] Error calculating breakpoints for ${imageUrl}\n${breakpointUrl}\n${errorReason}`);
    }
  }

}

exports.default = CloudinaryConnector;

_defineProperty(CloudinaryConnector, "BASE_CONFIG_DEFAULTS", {
  type: 'fetch',
  secure: true
});

_defineProperty(CloudinaryConnector, "BREAKPOINT_CONFIG_DEFAULTS", {
  minWidth: 320,
  maxWidth: 4000,
  minBreakpointSizeDiffKB: 25,
  maxBreakpoints: 6
});

_defineProperty(CloudinaryConnector, "TRANSFORMATION_DEFAULTS", {
  crop: 'fill',
  fetch_format: 'auto'
});

_defineProperty(CloudinaryConnector, "MAX_PIXEL", 25 * 1000 * 1000);