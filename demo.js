// import path from 'path';
import CloudinaryConnector from './src/CloudinaryConnector';

/* eslint-disable no-console */
async function demo() {
	const cloudinaryConnector = new CloudinaryConnector('demo' /* process.env.CLOUDINARY_CLOUD_NAME */);

	// Srcset
	const imageUrl = 'https://res.cloudinary.com/idemo/image/upload/sofa_cat.jpg';
	const options = {
		aspectRatio: '16x9'
	};

	const srcSet = await cloudinaryConnector.getSrcSet(imageUrl, options);

	console.log(srcSet);

	// PDF
	const pdfUrl = 'https://mam.schneider-electric.com/public/67.ZK-D.1709.pdf';
	const pdfOptions = {
		crop: 'fit',
		fetch_format: 'png',
		page: 1,
		breakpointConfig: {
			maxWidth: 1000
		}
	};

	const pdfThumbSrcSet = await cloudinaryConnector.getSrcSet(pdfUrl, pdfOptions);

	console.log(pdfThumbSrcSet);
}

demo();
