import axios from 'axios';

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
const API_KEY = process.env.GOOGLE_DRIVE_API_KEY || '';

export interface DriveImage {
  fileId: string;
  filename: string;
  sku: string;
  driveUrl: string;
  thumbnailUrl: string;
  mimeType: string;
}

export async function fetchImagesFromDrive(): Promise<DriveImage[]> {
  if (!DRIVE_FOLDER_ID) {
    console.warn('GOOGLE_DRIVE_FOLDER_ID not set. Skipping image fetch.');
    return [];
  }

  try {
    const images: DriveImage[] = [];
    let pageToken: string | undefined;

    // Paginate through all files in the folder
    do {
      const response = await axios.get(
        'https://www.googleapis.com/drive/v3/files',
        {
          params: {
            q: `'${DRIVE_FOLDER_ID}' in parents and trashed=false`,
            fields:
              'files(id, name, mimeType, thumbnailLink), nextPageToken',
            pageSize: 1000,
            pageToken,
            ...(API_KEY && { key: API_KEY }),
          },
          timeout: 30000,
        }
      );

      const files = response.data.files || [];

      files.forEach((file: any) => {
        const sku = extractSKUFromFilename(file.name);
        if (sku && isImageFile(file.mimeType)) {
          images.push({
            fileId: file.id,
            filename: file.name,
            sku,
            driveUrl: `https://drive.google.com/uc?id=${file.id}`,
            thumbnailUrl: file.thumbnailLink || '',
            mimeType: file.mimeType,
          });
        }
      });

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return images;
  } catch (error) {
    console.error('Error fetching images from Drive:', error);
    return [];
  }
}

export function groupImagesBySKU(images: DriveImage[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  images.forEach(image => {
    if (!map.has(image.sku)) {
      map.set(image.sku, []);
    }
    map.get(image.sku)!.push(image.driveUrl);
  });

  return map;
}

function extractSKUFromFilename(filename: string): string | null {
  // Patterns to match:
  // SKU-12345-angle1.jpg
  // SKU-12345_back.jpg
  // 12345-front.jpg
  // 12345_angle.jpg

  const patterns = [
    /^([A-Z]*-?\d+)[-_].+\.\w+$/,  // SKU-12345-angle.jpg or SKU-12345_angle.jpg
    /^(\d+)[-_].+\.\w+$/,           // 12345-front.jpg or 12345_front.jpg
  ];

  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

function isImageFile(mimeType: string): boolean {
  const imageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return imageTypes.includes(mimeType.toLowerCase());
}
