// Recive el video y lo convierte

let ffmpeg = require("ffmpeg");
const fs = require("fs");

const { workerData, parentPort } = require("worker_threads");

let dest = "/dest/video.mp4";

try {
    let process = new ffmpeg(workerData.file);
    process.then(video => {
        video.fnAddWatermark(
            __dirname + "/marcadeagua.png",
            __dirname + "/" + workerData.filename, {
                position: "C"
            },
            function(err, file) {
                if (!err) {
                    console.log("El nombre del video procesado es " + file);
                    parentPort.postMessage({ status: "Done", file: file });
                } else {
                    console.log(err);
                }
            }
        )
    });
} catch (e) {
    console.log(e.code);
    console.log(e.msg);
}