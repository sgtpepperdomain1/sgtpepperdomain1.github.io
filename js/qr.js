"use strict";

$(document).ready(function () {
	makeQR($("#qr-txt-input").val());

	makeQArt($("#qr-txt-input").val(), $("#qr-back-img").attr("src"), $("#qr-filter input:checked").attr("data-filter"));

	$("#qr-txt-input").on("blur", function () {
		$("#qr-img-input").val("");
		makeQR($(this).val());
		makeQArt($(this).val(), $("#qr-back-img").attr("src"), $("#qr-filter input:checked").attr("data-filter"));
	});

	$("#qr-img-input").on("change", async function () {
		let qr_img = $(this)[0].files[0];
		let fr = await dataUrlPromise(qr_img);
		$("#qr-img img").attr("src", fr.result);

		let new_text = await decodeQR(fr.result);
		$("#qr-txt-input").val(new_text);

		makeQArt(new_text, $("#qr-back-img").attr("src"), $("#qr-filter input:checked").attr("data-filter"));
	});

	$("#back-img-input").on("change", async function () {
		let back_img = $(this)[0].files[0];
		let fr = await dataUrlPromise(back_img);
		$("#qr-back-img").attr("src", fr.result);

		makeQR($("#qr-txt-input").val());
		makeQArt($("#qr-txt-input").val(), fr.result, $("#qr-filter input:checked").attr("data-filter"));
	});

	$("#qr-filter input:radio").on("change", function () {
		let new_filter = $(this).attr("data-filter");

		makeQR($("#qr-txt-input").val());
		makeQArt($("#qr-txt-input").val(), $("#qr-back-img").attr("src"), new_filter);
	});
});

function makeQR(value) {
	let qr = qrcode.QRCode(10, 'H');
	qr.addData(value);
	qr.make();
	$("#qr-img").empty().append(qr.createImgTag());
}


function makeQArt(value, img_path, filter) {
	new QArt({
		value: value,
		imagePath: img_path,
		filter: filter
	})
	
		.make((canvas) => {
			$("#qr-result-img").attr("src", canvas.toDataURL())
		})
}


function decodeQR(img_url) {
	return new Promise((resolve, reject) => {
		qrcode.decode(img_url);
		qrcode.callback = data => {
			resolve(data);
		};
	});
}

function dataUrlPromise(file) {
	return new Promise((resolve, reject) => {
		let fr = new FileReader();
		fr.readAsDataURL(file);
		fr.onloadend = () => {
			resolve(fr);
		};
	});
}
