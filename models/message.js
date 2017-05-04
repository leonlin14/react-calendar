var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Messages = new mongoose.Schema({
	memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
	receiverId: { type: Schema.Types.ObjectId, ref: 'Receiver' },
	message: String,
	video: { type: Boolean, default: false },
	image: { type: Boolean, default: false },
	sendYear: String,
	sendMonth: String,
	sendDate: { type: Date, default: null },
	disabled: { type: Boolean, default: true },
	isViewed: { type: Boolean, default: false },
	isHide: { type: Boolean, default: false },
	permissions: { type: Schema.Types.ObjectId, ref: 'Permission' },
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now }
});

module.exports = function(lApp) {
	return mongoose.model('Messages', Messages);
};
