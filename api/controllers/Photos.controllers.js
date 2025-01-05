const Photo = require('../models/photo.model');

module.exports.upload = (req, res, next) => {
	if (!req.file) {
		next(new Error('No file uploaded!'));
		return;
	}
	res.json({ photoUrl: req.file.path });
};

module.exports.create = (req, res, next) => {
	Photo.create(req.body)
		.then((photo) => res.status(201).json(photo))
		.catch(next);
};

// module.exports.list = (req, res, next) => {
// 	Photo.find()
// 		.then((photos) => res.json(photos))
// 		.catch(next);
// };

module.exports.listByUser = (req, res, next) => {
	const criterial = { user: req.params.userId };
	Photo.find(criterial)
		.then((photos) => res.json(photos))
		.catch(next);
};

module.exports.delete = (req, res, next) => {
	Photo.deleteOne({ _id: req.photo.id })
		.then(() => res.status(204).send())
		.catch(next);
};
