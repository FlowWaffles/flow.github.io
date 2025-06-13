export function obiWaniFy() {
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
         const img = document.getElementById('obiWan') as HTMLImageElement | null;
         const dataUrl = getDataUrl(img);
         const css = "font-size: 40px;color:rgb(255,105,180);font-family:monospace;letter-spacing: 5px; text-shadow: 3px 3px 20px #ff99cc, -2px 1px 30px #ff99cc;padding:20px;";
         console.log("%cWELCOME %s", css, 'TO FLOW.FAIL STRANGER.');
         console.log("%cThis is not the console you are looking for.", "color:rgb(0,0,0); font-size:20px;font-family:monospace;padding-left:20px;");
         console.log("%c      ", "font-size:167px; margin-left:20px;background:url(" + dataUrl + ") no-repeat;");
    }
 }

 function getDataUrl(img: HTMLImageElement | null): string {
    if (!img) {
            console.warn("Image element not found");
            return '';
        }   

     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
     canvas.width = img.width;
     canvas.height = img.height;
     ctx?.drawImage(img, 0, 0);
     return canvas.toDataURL('image/jpeg');
 }
 