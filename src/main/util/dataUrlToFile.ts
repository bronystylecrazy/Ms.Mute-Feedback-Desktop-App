import fs from 'fs';

export default function dataURLtoFile(dataurl, filename) {
 
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = Buffer.from(arr[1], 'base64').toString(), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    fs.writeFileSync( filename, u8arr, { encoding: 'base64' });
    // return new File([u8arr], filename, {type:mime});
}