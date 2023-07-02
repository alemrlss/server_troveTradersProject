/* eslint-disable prettier/prettier */
export const renameImage = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const filename = file.originalname;
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  callback(null, `${name}-${randomName}-${filename}`);
  //console.log(`Name: ${name}`);
  //console.log(`RandomName: ${randomName}`);
  //console.log(`filename: ${filename}`);
};

export const fileFilter = (req, file, callback) => {
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Invalid format type'), false);
  }

  if (file.size > maxSizeInBytes) {
    return callback(new Error('File size exceeds the limit'), false);
  }

  callback(null, true);
};
