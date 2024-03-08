const args = process.argv.slice(2);

if (args[1] === '*') {
    console.log((((1 * parseInt(args[0])) | 0) * parseInt(args[2])) | 0);
} else {
    console.log((((1 * parseInt(args[0])) | 0) * parseInt(args[1])) | 0);
}
