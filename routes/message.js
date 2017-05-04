var Router = require('koa-router');
var path = require('path');
var RestPack = require('restpack');
var Readable = require('stream').Readable;

module.exports = function(lApp) {
	var router = new Router();

	var Message = lApp.getLibrary('Message');
	var Storage = lApp.getLibrary('Storage');
	var Uploader = lApp.getLibrary('Uploader');

	router.post('/message/create', function *() {
		// Create a dataset for restful API
		var restpack = new RestPack();

		if (!this.request.body.memberId) {
			this.status = 401;
			return;
		}

		// Add Message
		try {
			var data = yield Message.create({
				memberId: this.request.body.memberId,
				receiverId: this.request.body.receiverId,
				message: this.request.body.message,
				sendYear: this.request.body.sendYear,
				sendMonth: this.request.body.sendMonth,
				sendDate: this.request.body.sendDate
			});
		} catch(e) {
			this.status = 500;
			return;
		}

		var videoFile = this.request.body.videoFile;
		if (videoFile) {
			var fileName = data.message._id;
			var originaldata = new Buffer(videoFile, 'base64');

			var rs = new Readable;
			rs.push(originaldata);
			rs.push(null);

			// Getting path to store videos file
			var videosPath = yield Storage.getPath('videos');
			var filepath = path.join(videosPath, fileName + '.webm');

			// Saving
			yield Uploader.saveFile(rs, filepath);

			// Save
			try {
				var message = yield Message.save(fileName, {
					video: true
				});
			} catch(e) {
				this.status = 500;
				return;
			}
		}

		// Return result to client
		restpack
			.setData({})
			.sendKoa(this);
	});

	router.get('/message/creater/list', function *() {
		var q = {};
		try {
			q = JSON.parse(this.request.query.q);
		} catch(e) {}

		var conditions = {};
		if (q.disabled !== undefined) {
			conditions.disabled = q.disabled;
		}
		if (q.memberId !== undefined) {
			conditions.memberId = q.memberId;
		}
		if (q.sendYear !== undefined) {
			conditions.sendYear = q.sendYear;
		}
		if (q.sendMonth !== undefined) {
			conditions.sendMonth = q.sendMonth;
		}
		if (q.sendDate !== undefined) {
			conditions.sendDate = q.sendDate;
		}

		// Fetching a list with specific condition
		var data = yield Message.list(conditions, [
			'_id',
			'memberId',
			'receiverId',
			'video',
			'message',
			'sendYear',
			'sendMonth',
			'sendDate',
			'disabled',
			'updated'
		]);

		this.body = {
			success: true,
			count: data.count,
			messages: data.messages
		};
	});

	router.del('/message/delete/:messageId', function *() {
		var messageId = this.params.messageId;

		try {
			yield Message.deleteMessages([ messageId ]);
		} catch(e) {
			this.status = 500;
			return;
		}

		this.body = {
			success: true
		};
	});

	return router;
};
