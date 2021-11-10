import express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import multer from 'multer';
import { Worker, isMainThread, workerData } from 'worker_threads';

require('dotenv').config();

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.filename + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ dest: 'uploads', storage: storage });

const app = new express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Referencia a las views

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.get("/", (req, res) => {
    res.render("index");
});

// Ruta para subir el video original

app.post("/upload-video", upload.single("ssvideo"), (req, res) => {
    if (isMainThread) {

        let thread = new Worker("./threads/worker.js", {
            workerData: {
                file: req.file.path,
                filename: req.file.filename
            }

        });


        //main actions
        thread.on("message", (data) => {
            res.download(data.file, req.file.filename);
        });

        thread.on("error", (err) => {
            console.log("Error en el thread", err);
        });

        thread.on("exit", (code) => {
            if (code != 0) {
                console(`El hilo se detuvo en el codigo de salida: ${code}`);
            }
        })

    }

});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`El servidor inicio por el puerto ${PORT}`);
});