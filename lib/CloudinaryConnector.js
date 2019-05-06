"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cloudinary_1 = tslib_1.__importDefault(require("cloudinary"));
var axios_1 = tslib_1.__importDefault(require("axios"));
;
;
var CloudinaryConnector = /** @class */ (function () {
    function CloudinaryConnector(cloudName, baseConfig) {
        if (baseConfig === void 0) { baseConfig = {}; }
        cloudinary_1.default.config({
            cloud_name: cloudName
        });
        // Make sure the default objects for the settings/defaults cannot be overwritten
        Object.freeze(CloudinaryConnector.BASE_CONFIG_DEFAULTS);
        Object.freeze(CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
        Object.freeze(CloudinaryConnector.TRANSFORMATION_DEFAULTS);
        this._baseConfig = tslib_1.__assign({}, CloudinaryConnector.BASE_CONFIG_DEFAULTS, baseConfig);
        this._breakpointConfig = tslib_1.__assign({}, CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
        this._transformationDefaults = tslib_1.__assign({}, CloudinaryConnector.TRANSFORMATION_DEFAULTS);
    }
    /**
     *
     * @param {Object} config
     */
    CloudinaryConnector.prototype.updateBaseConfig = function (config) {
        this._baseConfig = tslib_1.__assign({}, this._baseConfig, config);
    };
    /**
     *
     * @returns {{type: string, secure: boolean, baseConfig}|*}
     */
    CloudinaryConnector.prototype.getBaseConfig = function () {
        return this._baseConfig;
    };
    /**
     *
     * @param {Object} config
     */
    CloudinaryConnector.prototype.updateBreakpointConfig = function (config) {
        this._breakpointConfig = tslib_1.__assign({}, this._breakpointConfig, config);
    };
    /**
     *
     * @returns {{minBreakpointSizeDiffKB: number, maxBreakpoints: number, minWidth: number, maxWidth: number}|*}
     */
    CloudinaryConnector.prototype.getBreakpointConfig = function () {
        return this._breakpointConfig;
    };
    /**
     *
     * @param {Object} defaults
     */
    CloudinaryConnector.prototype.updateTransformationDefaults = function (defaults) {
        this._transformationDefaults = tslib_1.__assign({}, this._transformationDefaults, defaults);
    };
    /**
     *
     * @param {String} imageUrl
     * @param {Object|Array} options
     * @returns {Promise<{src: *, width: *, height: *}[]>}
     */
    CloudinaryConnector.prototype.getSrcSet = function (imageUrl, options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transformation, breakpoints, error_1, breakpointConfig;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transformation = options.transformation || options;
                        if (!Array.isArray(transformation)) {
                            transformation = [transformation];
                        }
                        // Append transformation defaults for the first transformation
                        transformation[0] = tslib_1.__assign({}, this._transformationDefaults, transformation[0]);
                        // Aspect Ratio Handling
                        transformation.map(function (transformationItem) {
                            /* eslint-disable no-param-reassign */
                            if (transformationItem.aspectRatio) {
                                transformationItem.aspect_ratio = transformationItem.aspectRatio.replace(/x/, ':');
                                delete transformationItem.aspectRatio;
                            }
                            /* eslint-enable no-param-reassign */
                            return transformationItem;
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getBreakpoints(imageUrl, transformation, options.breakpointConfig)];
                    case 2:
                        breakpoints = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        // Catch the error and continue without calculated breakpoints
                        console.error(error_1.message);
                        breakpointConfig = tslib_1.__assign({}, this._breakpointConfig, options.breakpointConfig);
                        breakpoints = [breakpointConfig.minWidth, breakpointConfig.minWidth / 2 + breakpointConfig.maxWidth / 2, breakpointConfig.maxWidth];
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, breakpoints.map(function (breakpoint) {
                            transformation[0].width = breakpoint;
                            return {
                                src: cloudinary_1.default.url(imageUrl, tslib_1.__assign({}, _this._baseConfig, { transformation: transformation })),
                                width: breakpoint,
                            };
                        })];
                }
            });
        });
    };
    /**
     *
     * @param {String} imageUrl
     * @param {Array} transformation
     * @param {Object} [breakpointConfig]
     * @returns {Promise<Array>}
     */
    CloudinaryConnector.prototype.getBreakpoints = function (imageUrl, transformation, breakpointConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _breakpointConfig, breakpointTransformation, breakpointUrl, response, error_2, errorReason;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _breakpointConfig = tslib_1.__assign({}, this._breakpointConfig, breakpointConfig);
                        // If a "list" is given in the breakpoint config, use that list instead of calculating one.
                        if (_breakpointConfig.list && _breakpointConfig.list.length) {
                            return [2 /*return*/, _breakpointConfig.list];
                        }
                        // Don't calculate breakpoints if max width is below the smallest wanted breakpoint
                        if (_breakpointConfig.maxWidth <= _breakpointConfig.minWidth) {
                            return [2 /*return*/, [_breakpointConfig.maxWidth]];
                        }
                        breakpointTransformation = transformation.concat([{
                                width: "auto:breakpoints_" + _breakpointConfig.minWidth + "_" + _breakpointConfig.maxWidth + "_" + _breakpointConfig.minBreakpointSizeDiffKB + "_" + _breakpointConfig.maxBreakpoints + ":json"
                            }]);
                        breakpointUrl = cloudinary_1.default.url(imageUrl, tslib_1.__assign({}, this._baseConfig, { transformation: breakpointTransformation }));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get(breakpointUrl)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.breakpoints];
                    case 3:
                        error_2 = _a.sent();
                        errorReason = error_2.response.headers['x-cld-error'];
                        throw new Error("[CloudinaryConnector] Error calculating breakpoints for " + imageUrl + "\n" + breakpointUrl + "\n" + errorReason);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CloudinaryConnector.BASE_CONFIG_DEFAULTS = {
        type: 'fetch',
        secure: true
    };
    CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS = {
        minWidth: 320,
        maxWidth: 4000,
        minBreakpointSizeDiffKB: 25,
        maxBreakpoints: 6
    };
    CloudinaryConnector.TRANSFORMATION_DEFAULTS = {
        crop: 'fill',
        fetch_format: 'auto'
    };
    CloudinaryConnector.MAX_PIXEL = 25 * 1000 * 1000;
    return CloudinaryConnector;
}());
exports.default = CloudinaryConnector;
//# sourceMappingURL=CloudinaryConnector.js.map