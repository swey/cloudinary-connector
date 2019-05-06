"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import path from 'path';
var CloudinaryConnector_1 = tslib_1.__importDefault(require("./CloudinaryConnector"));
/* eslint-disable no-console */
function demo() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var cloudinaryConnector, imageUrl, options, srcSet, pdfUrl, pdfOptions, pdfThumbSrcSet;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cloudinaryConnector = new CloudinaryConnector_1.default('demo' /* process.env.CLOUDINARY_CLOUD_NAME */);
                    imageUrl = 'https://res.cloudinary.com/idemo/image/upload/sofa_cat.jpg';
                    options = {
                        aspectRatio: '16x9'
                    };
                    return [4 /*yield*/, cloudinaryConnector.getSrcSet(imageUrl, options)];
                case 1:
                    srcSet = _a.sent();
                    console.log(srcSet);
                    pdfUrl = 'https://mam.schneider-electric.com/public/67.ZK-D.1709.pdf';
                    pdfOptions = {
                        crop: 'fit',
                        fetch_format: 'png',
                        page: 1,
                        breakpointConfig: {
                            maxWidth: 1000
                        }
                    };
                    return [4 /*yield*/, cloudinaryConnector.getSrcSet(pdfUrl, pdfOptions)];
                case 2:
                    pdfThumbSrcSet = _a.sent();
                    console.log(pdfThumbSrcSet);
                    return [2 /*return*/];
            }
        });
    });
}
demo();
//# sourceMappingURL=demo.js.map