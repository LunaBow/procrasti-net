import { api } from '../../lib/api.ts';
import { initGallery } from "./displayGallery.js";

const artType = document.getElementById("artType");

function updateArtFields() {
    if (artType.value === "Drawing") {
        document.getElementById("artImage").style.display = "none";
        document.getElementById("customArtImage").style.display = "block";
        document.getElementById("artLink").style.display = "none";
    } else if (artType.value === "Book") {
        document.getElementById("artImage").style.display = "none";
        document.getElementById("customArtImage").style.display = "none";
        document.getElementById("artLink").style.display = "none";
    } else if (artType.value === "AV") {
        document.getElementById("artImage").style.display = "none";
        document.getElementById("customArtImage").style.display = "none";
        document.getElementById("artLink").style.display = "block";
    }
}

artType.addEventListener("change", updateArtFields);
updateArtFields();

const form = document.getElementById("uploadForm");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if(submitBtn) submitBtn.disabled = true;

    try{
        const user = await api.getCurrentUser();
        if (!user) {
            alert("You must be logged in to upload art");
            if(submitBtn) submitBtn.disabled = false;
            return;
        }

        const title = document.getElementById("artTitle").value;
        const description = document.getElementById("artDescription").value;
        const type = artType.value;

        if(type === "Book"){
            api.uploadBook({
                title: title,
                content: description,
                createdBy: user.id
            });
            alert("Book sent (not waiting for response)");
            initGallery();
        }else if (type === "Drawing") {
            const fileInput = document.getElementById("artImage");
            const file = fileInput.files[0];
            if(!file){
                alert("Please upload an image first");
                return;
            }
            await api.uploadDrawing({
                title: title,
                description: description,
                createdBy: user.id
            }, file);
        }
        else if (type === "AV") {
            const link = document.getElementById("artLink").value;
            if (!link) {
                alert("Please provide a link.");
                return;
            }
            api.uploadAV({
                title: title,
                description: description,
                mediaUrl: link,
                createdBy: user.id
            });
        }
        alert("Everything uploaded successfully!");
        form.reset();
        updateArtFields();
        await initGallery();
        setTimeout(async () => {
            await initGallery();
        }, 500);
    }catch(e){
        console.error("Upload failed!",e);
        alert("Upload failed! Check console.");
    } finally{
        if(submitBtn) submitBtn.disabled = false;
    }
});