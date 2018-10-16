"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	try {
		var info = gen[key](arg);
		var value = info.value;
	} catch (error) {
		reject(error);
		return;
	}

	if (info.done) {
		resolve(value);
	} else {
		Promise.resolve(value).then(_next, _throw);
	}
}

function _asyncToGenerator(fn) {
	return function () {
		var self = this,
			args = arguments;
		return new Promise(function (resolve, reject) {
			var gen = fn.apply(self, args);

			function _next(value) {
				asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
			}

			function _throw(err) {
				asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
			}

			_next(undefined);
		});
	};
}

$(document).ready(function () {
	makeQR($("#qr-txt-input").val());

	makeQArt($("#qr-txt-input").val(), $("#qr-back-img").attr("src"), $("#qr-filter input:checked").attr("data-filter"));

	$("#qr-txt-input").on("blur", function () {
		$("#qr-img-input").val("");
		makeQR($(this).val());
		makeQArt($(this).val(), $("#qr-back-img").attr("src"), $("#qr-filter input:checked").attr("data-filter"));
	});

	$("#qr-img-input").on("change",
		/*#__PURE__*/
		_asyncToGenerator(
			/*#__PURE__*/
			regeneratorRuntime.mark(function _callee() {
				var qr_img, fr, new_text;
				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								qr_img = $(this)[0].files[0];
								_context.next = 3;
								return dataUrlPromise(qr_img);

							case 3:
								fr = _context.sent;
								$("#qr-img img").attr("src", fr.result);

								_context.next = 7;
								return decodeQR(fr.result);

							case 7:
								new_text = _context.sent;
								$("#qr-txt-input").val(new_text);

								makeQArt(new_text, $("#qr-back-img").attr("src"), $("#qr-filter input:checked").attr("data-filter"));

							case 10:
							case "end":
								return _context.stop();
						}
					}
				}, _callee, this);
			})));

	$("#back-img-input").on("change",
		/*#__PURE__*/
		_asyncToGenerator(
			/*#__PURE__*/
			regeneratorRuntime.mark(function _callee2() {
				var back_img, fr;
				return regeneratorRuntime.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								back_img = $(this)[0].files[0];
								_context2.next = 3;
								return dataUrlPromise(back_img);

							case 3:
								fr = _context2.sent;
								$("#qr-back-img").attr("src", fr.result);

								makeQR($("#qr-txt-input").val());
								makeQArt($("#qr-txt-input").val(), fr.result, $("#qr-filter input:checked").attr("data-filter"));

							case 7:
							case "end":
								return _context2.stop();
						}
					}
				}, _callee2, this);
			})));

	$("#qr-filter input:radio").on("change", function () {
		var new_filter = $(this).attr("data-filter");

		makeQR($("#qr-txt-input").val());
		makeQArt($("#qr-txt-input").val(), $("#qr-back-img").attr("src"), new_filter);
	});
});

function makeQR(value) {
	var qr = qrcode.QRCode(10, 'H');
	qr.addData(value);
	qr.make();
	$("#qr-img").empty().append(qr.createImgTag());
}

function makeQArt(value, img_path, filter) {
	new QArt({
		value: value,
		imagePath: img_path,
		filter: filter
	}).make(document.getElementById('qr-result'));
}

function decodeQR(img_url) {
	return new Promise(function (resolve, reject) {
		qrcode.decode(img_url);

		qrcode.callback = function (data) {
			resolve(data);
		};
	});
}

function dataUrlPromise(file) {
	return new Promise(function (resolve, reject) {
		var fr = new FileReader();
		fr.readAsDataURL(file);

		fr.onloadend = function () {
			resolve(fr);
		};
	});
}
