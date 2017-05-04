var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Receiver = new mongoose.Schema({
	memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
	name: String,
	displayname: String,
	email: String,
	phone: String,
	address: String,
	disabled: { type: Boolean, default: true },
	permissions: { type: Schema.Types.ObjectId, ref: 'Permission' },
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now }
});

module.exports = function(lApp) {
	return mongoose.model('Receiver', Receiver);
};
