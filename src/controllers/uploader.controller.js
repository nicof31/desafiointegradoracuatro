
class UploaderController {
    constructor(){
       
    }

    uploadImage = async (req, res) => {
        try {
            uploader.single("image")(req, res, (err) => {
                if (err) {
                    console.error(`UploaderController: Error al subir la imagen: ${err}`);
                    return res.status(500).json({ status: "error", message: `UploaderController: Error al subir la imagen: ${err}` });
                }
                const imgUpload = req.file;
                if (!imgUpload) {
                    return res.status(404).json({ status: "error", message: "Cargue el archivo" });
                }
                //uploader.push(imgUpload);
                return res.json({ status: "success", message: "IMG upload" });
            });
        } catch(error) {
            console.error(`UploaderController: Error al subir la imagen: ${error}`);
            return res.status(500).json({ status: "error", message: `UploaderController: Error al subir la imagen: ${error}` });
        }
    }
}

export default UploaderController;