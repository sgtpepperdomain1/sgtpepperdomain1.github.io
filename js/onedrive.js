"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

window.onload = () => {
  onedrive_client_id = '89c54cde-0402-4c91-9d53-ab0e2fcb88d3';
  onedrive_scope = 'openid https://graph.microsoft.com/Files.ReadWrite.All';
  onedrive_redirect_url = 'https://sgtpepperslonelyhearts.club/onedrive';
  onedrive_login_url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${onedrive_client_id}&response_type=token&redirect_uri=${onedrive_redirect_url}&scope=${onedrive_scope}`;
  onedrive_token = '';
  ajax_timeout = 30000;
  mb_4 = 4 * 1000 * 1000;
  mb_60 = 60 * 1000 * 1000;
  tokenFlow();
  document.getElementById("img-upload").addEventListener("click", () => {
    let img_origin = document.getElementById("afile").files[0];
    reset();
    if (!fileCheck(img_origin)) return;

    let _defaultNames = defaultNames(),
        _defaultNames2 = _slicedToArray(_defaultNames, 2),
        dir_name = _defaultNames2[0],
        file_name = _defaultNames2[1];

    let file_type = img_origin.type.split('/')[1];

    let _file_names = file_names(file_name, file_type),
        _file_names2 = _slicedToArray(_file_names, 2),
        origin_name = _file_names2[0],
        preview_name = _file_names2[1];

    if (img_origin.type.indexOf('gif') !== -1) {
      gifProcess(img_origin, dir_name, origin_name, preview_name);
    } else {
      nonGifProcess(img_origin, dir_name, origin_name, preview_name);
    }
  });
};

async function gifProcess(img, dir_name, file_name, preview_name) {
  try {
    let origin_upload_response = await uploadMain(img, dir_name, file_name);
    let origin_share_response = await getShareId(origin_upload_response.data.id);
    let origin_share_url = img_share_url(origin_share_response.data.shareId);
    document.getElementById("origin-img").setAttribute("src", origin_share_url);
    document.getElementById("img-url").innerText = origin_share_url;
  } catch (err) {
    if (err.response.status === 401) {
      alert('需要重新登录');
      window.location = onedrive_login_url;
    }
  }

  if (ifPreview()) {
    let file_reader = await arrayBufferPromise(img);
    let img_array_buffer = file_reader.result;
    let img_origin_blob = new Blob([img_array_buffer]);
    let img_origin_blob_url = URL.createObjectURL(img_origin_blob);
    let frames = await gifFrames({
      url: img_origin_blob_url,
      frames: 0,
      outputType: 'canvas'
    });
    let frame1_canvas = frames[0].getImage();
    let frame1_blob = await canvasToBlob(frame1_canvas);
    let frame1_compressed = await imgCompress(frame1_blob);

    try {
      let preview_upload_response = await uploadMain(frame1_compressed, dir_name, preview_name);
      let preview_share_response = await getShareId(preview_upload_response.data.id);
      let preview_share_url = img_share_url(preview_share_response.data.shareId);
      document.getElementById("pre-img").setAttribute("src", preview_share_url);
      document.getElementById("pre-url").innerText = preview_share_url;
    } catch (err) {
      if (err.response.status === 401) {
        alert('需要重新登录');
        window.location = onedrive_login_url;
      }
    }
  }
}

async function nonGifProcess(img, dir_name, file_name, preview_name) {
  try {
    let origin_share_url = await uploadAndShare(img, dir_name, file_name);
    document.getElementById("origin-img").setAttribute("src", origin_share_url);
    document.getElementById("img-url").innerText = origin_share_url;
  } catch (err) {
    if (err.response.status === 401) {
      alert('需要重新登录');
      window.location = onedrive_login_url;
    }
  }

  if (ifPreview()) {
    try {
      let img_compressed = await imgCompress(img);
      let preview_share_url = await uploadAndShare(img_compressed, dir_name, preview_name);
      document.getElementById("pre-img").setAttribute("src", preview_share_url);
      document.getElementById("pre-url").innerText = preview_share_url;
    } catch (err) {
      if (err.response.status === 401) {
        alert('需要重新登录');
        window.location = onedrive_login_url;
      }
    }
  }
}

async function uploadMain(blob, dir_name, file_name) {
  if (blob.size >= mb_4) {
    let upload_url = await uploadPic60Step1(dir_name, file_name);
    return uploadPic60Step2(blob, upload_url, blob.size);
  } else {
    return uploadPic4(blob, dir_name, file_name);
  }
}

async function uploadAndShare(blob, dir_name, file_name) {
  if (blob.size >= mb_4) {
    let upload_url_response = await uploadPic60Step1(dir_name, file_name);
    let upload_response = await uploadPic60Step2(blob, upload_url_response, blob.size);
    let share_response = await getShareId(upload_response.data.id);
    return img_share_url(share_response.data.shareId);
  } else {
    let upload_response = await uploadPic4(blob, dir_name, file_name);
    let share_response = await getShareId(upload_response.data.id);
    return img_share_url(share_response.data.shareId);
  }
}

function uploadPic4(blob, dir_name, file_full_name) {
  return axios({
    method: 'PUT',
    url: upload_url_4mb(dir_name, file_full_name),
    data: blob,
    headers: {
      'Authorization': 'Bearer ' + onedrive_token
    },
    timeout: ajax_timeout
  });
}

function uploadPic60Step1(dir_name, file_full_name) {
  return axios({
    method: 'POST',
    url: upload_url_60mb(dir_name, file_full_name),
    headers: {
      'Authorization': 'Bearer ' + onedrive_token,
      'Content-Type': 'application/json'
    },
    timeout: ajax_timeout
  });
}

function uploadPic60Step2(blob, upload_url, size) {
  return axios({
    method: 'PUT',
    url: upload_url,
    data: blob,
    headers: {
      'Content-Range': 'bytes 0-' + (size - 1) + '/' + size
    },
    timeout: ajax_timeout
  });
}

function getShareId(id) {
  return axios({
    method: 'POST',
    url: share_upload_url(id),
    data: {
      type: 'view',
      scope: 'anonymous'
    },
    headers: {
      'Authorization': 'Bearer ' + onedrive_token,
      'Content-Type': 'application/json'
    },
    timeout: ajax_timeout
  });
}

function upload_url_4mb(dir_name, file_full_name) {
  return `https://graph.microsoft.com/v1.0/me/drive/root:/${dir_name}/${file_full_name}:/content`;
}

function upload_url_60mb(dir_name, file_full_name) {
  return `https://graph.microsoft.com/v1.0/drive/root:/${dir_name}/${file_full_name}:/createUploadSession`;
}

function share_upload_url(id) {
  return `https://graph.microsoft.com/v1.0/me/drive/items/${id}/createLink`;
}

function img_share_url(share_id) {
  return `https://api.onedrive.com/v1.0/shares/${share_id}/root/content`;
}

function imgCompress(data, max_width = 360, max_height = 200, quality = 0.6) {
  const imageCompressor = new ImageCompressor();
  return imageCompressor.compress(data, {
    maxWidth: max_width,
    maxHeight: max_height,
    quality: quality
  });
}

function tokenFlow() {
  let url_sharp = window.location.href.split('#');

  if (url_sharp.length === 1) {
    window.location = onedrive_login_url;
    return;
  }

  let token_reg = url_sharp[1].match(/(access_token=)([a-zA-Z0-9/%]*)/);

  if (!token_reg) {
    window.location = onedrive_login_url;
    return;
  }

  onedrive_token = token_reg[2];
}

function defaultNames() {
  let dir_input = document.getElementById("filepath").value;
  let file_name_input = document.getElementById("filename").value;
  let dir = dir_input ? dir_input : 'sgt';
  let file_name = file_name_input ? file_name_input : new Date().getTime();
  return [dir, file_name];
}

function fileCheck(file) {
  if (!file) {
    alert('未选中文件');
    return false;
  }

  if (!file.type.match(/image.*/)) {
    alert('不是图片格式');
    return false;
  }

  if (file.size > mb_60) {
    let file_size = file.size;
    alert(`文件最大60*1000*1000，当前文件大小${file_size}`);
    return false;
  }

  return true;
}

function file_names(file_name, file_type) {
  if (file_type === 'gif') return [`${file_name}.${file_type}`, `${file_name}-preiview.jpg`];
  return [`${file_name}.${file_type}`, `${file_name}-preiview.${file_type}`];
}

function arrayBufferPromise(file) {
  return new Promise((resolve, reject) => {
    let fr = new FileReader();
    fr.readAsArrayBuffer(file);

    fr.onloadend = () => {
      resolve(fr);
    };
  });
}

function canvasToBlob(canvas) {
  return new Promise(function (resolve, reject) {
    canvas.toBlob(function (blob) {
      resolve(blob);
    });
  });
}

function reset() {
  document.getElementById("afile").value = '';
  document.getElementById("origin-img").setAttribute("src", "");
  document.getElementById("pre-img").setAttribute("src", "");
  document.getElementById("img-url").innerText = "";
  document.getElementById("pre-url").innerText = "";
}

function ifPreview() {
  return document.querySelector('input[name="if-pre"]:checked').value === "pre-true";
}
