"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cloudinary_1 = tslib_1.__importDefault(require("cloudinary"));
var cloudinary_core_1 = require("cloudinary-core");
var axios_1 = tslib_1.__importDefault(require("axios"));
;
var CloudinaryConnector = /** @class */ (function () {
    function CloudinaryConnector(cloudName, baseConfig) {
        cloudinary_1.default.config({
            cloud_name: cloudName
        });
        // Make sure the default objects for the settings/defaults cannot be overwritten
        Object.freeze(CloudinaryConnector.BASE_OPTIONS_DEFAULTS);
        Object.freeze(CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
        Object.freeze(CloudinaryConnector.TRANSFORMATION_DEFAULTS);
        this._baseOptions = tslib_1.__assign({}, CloudinaryConnector.BASE_OPTIONS_DEFAULTS, baseConfig);
        this._breakpointConfig = tslib_1.__assign({}, CloudinaryConnector.BREAKPOINT_CONFIG_DEFAULTS);
        this._transformationDefaults = tslib_1.__assign({}, CloudinaryConnector.TRANSFORMATION_DEFAULTS);
    }
    /**
     *
     * @param {Object} options
     */
    CloudinaryConnector.prototype.updateBaseOptions = function (options) {
        this._baseOptions = tslib_1.__assign({}, this._baseOptions, options);
    };
    /**
     *
     */
    CloudinaryConnector.prototype.getBaseOptions = function () {
        return this._baseOptions;
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
     */
    CloudinaryConnector.prototype.getInfo = function (assetId, transformation) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transformationChain, cloudinaryUrl, response, error_1, errorReason;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transformationChain = this.getTransformationChain(transformation);
                        transformationChain = transformationChain.chain();
                        transformationChain.flags('getinfo');
                        cloudinaryUrl = cloudinary_1.default.url(assetId, tslib_1.__assign({}, transformationChain.toOptions(), { secure: true }));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get(cloudinaryUrl)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_1 = _a.sent();
                        console.log(error_1);
                        errorReason = error_1.response && error_1.response.headers ? error_1.response.headers['x-cld-error'] : error_1.message;
                        throw new Error("[CloudinaryConnector] Error getting info for " + assetId + "\n" + cloudinaryUrl + "\n" + errorReason);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param {String} imageUrl
     * @param {Object|Array} options
     */
    CloudinaryConnector.prototype.getSrcSet = function (imageUrl, transformation, breakpointConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transformationChain, breakpoints, error_2, joinedBreakpointConfig;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transformationChain = this.getTransformationChain(transformation);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getBreakpoints(imageUrl, transformationChain, breakpointConfig)];
                    case 2:
                        breakpoints = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        // Catch the error and continue without calculated breakpoints
                        console.error(error_2.message);
                        joinedBreakpointConfig = tslib_1.__assign({}, this._breakpointConfig, breakpointConfig);
                        breakpoints = [joinedBreakpointConfig.minWidth, joinedBreakpointConfig.minWidth / 2 + joinedBreakpointConfig.maxWidth / 2, joinedBreakpointConfig.maxWidth];
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, breakpoints.map(function (breakpoint) {
                            return {
                                src: cloudinary_1.default.url(imageUrl, tslib_1.__assign({}, transformationChain.toOptions(), { width: breakpoint, secure: true })),
                                width: breakpoint,
                            };
                        })];
                }
            });
        });
    };
    CloudinaryConnector.prototype.getTransformationChain = function (transformation) {
        var transformationChain = cloudinary_core_1.Transformation.new(tslib_1.__assign({}, this._baseOptions, this._transformationDefaults));
        // apply custom transformation
        if (transformation) {
            transformationChain = cloudinary_core_1.Transformation.new(tslib_1.__assign({}, transformationChain, ((transformation.toOptions !== undefined)
                ? transformation.toOptions()
                : transformation)));
        }
        return transformationChain;
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
            var _breakpointConfig, transformationChain, breakpointUrl, response, error_3, errorReason;
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
                        transformationChain = new cloudinary_core_1.Transformation(transformation.toOptions());
                        transformationChain.width("auto:breakpoints_" + _breakpointConfig.minWidth + "_" + _breakpointConfig.maxWidth + "_" + _breakpointConfig.minBreakpointSizeDiffKB + "_" + _breakpointConfig.maxBreakpoints + ":json");
                        breakpointUrl = cloudinary_1.default.url(imageUrl, tslib_1.__assign({}, transformationChain.toOptions(), { secure: true }));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get(breakpointUrl)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.breakpoints];
                    case 3:
                        error_3 = _a.sent();
                        errorReason = error_3.response.headers['x-cld-error'];
                        throw new Error("[CloudinaryConnector] Error calculating breakpoints for " + imageUrl + "\n" + breakpointUrl + "\n" + errorReason);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CloudinaryConnector.BASE_OPTIONS_DEFAULTS = {
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