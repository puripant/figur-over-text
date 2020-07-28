const maxWidth = 800;

let option = 'grabcut';
let input, src, dst, dst2;
let width, height;

let imgElement = document.getElementById('image')
imgElement.onload = () => {
  input = cv.imread('image');
  cv.imshow('background', input);

  // width = Math.min(input.cols, maxWidth);
  // height = Math.min(input.rows, width * input.rows / input.cols);
  // cv.resize(input, input, new cv.Size(width, height), 0, 0, cv.INTER_AREA);

  src = input.clone();
  // cv.resize(src, src, new cv.Size(width/2, height/2), 0, 0, cv.INTER_AREA);
  cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
  // cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  // cv.medianBlur(src, src, 5);

  update(option);
}

let inputElement = document.getElementById('file');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

function update(option) {
  switch(option) {
    case 'grabcut':
      grabcut();
      break;
    case 'removebg': break;
    case 'bodypix': break;
    case 'maskrcnn': break;
    default: break;
  }
}
function grabcut() {
  let mask = new cv.Mat();
  let bgdModel = new cv.Mat();
  let fgdModel = new cv.Mat();
  let rect = new cv.Rect(100, 50, 300, 800);
  cv.grabCut(src, mask, rect, bgdModel, fgdModel, 1, cv.GC_INIT_WITH_RECT);

  dst = input.clone()
  for (let i = 0; i < src.rows; i++) {
    for (let j = 0; j < src.cols; j++) {
      if (mask.ucharPtr(i, j)[0] == 0 || mask.ucharPtr(i, j)[0] == 2) { // obvious & possible background; 1 & 3 for obvious and possible foreground
        dst.ucharPtr(i, j)[0] = 0;
        dst.ucharPtr(i, j)[1] = 0;
        dst.ucharPtr(i, j)[2] = 0;
      }
    }
  }
  let color = new cv.Scalar(0, 0, 255);
  let point1 = new cv.Point(rect.x, rect.y);
  let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
  cv.rectangle(dst, point1, point2, color);

  cv.imshow('foreground', dst);
  dst.delete();
  
  mask.delete();
  bgdModel.delete();
  fgdModel.delete();
}

function onOpenCvReady() {
  inputElement.disabled = false;
}