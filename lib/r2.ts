import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_PUBLIC_CDN = (process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_URL || '').replace(/\/$/, '');

let s3ClientInstance: S3Client | null = null;

function getR2Client(): S3Client | null {
  if (s3ClientInstance) return s3ClientInstance;

  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    console.warn('⚠️ Cloudflare R2 credentials not fully configured.');
    return null;
  }

  s3ClientInstance = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  return s3ClientInstance;
}

/**
 * Uploads a Buffer to Cloudflare R2 bucket and returns the public CDN URL
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/jpeg'
): Promise<string | null> {
  const client = getR2Client();
  if (!client || !R2_BUCKET || !R2_PUBLIC_CDN) {
    return null;
  }

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    const publicUrl = `${R2_PUBLIC_CDN}/${key}`;
    console.log(`✅ Uploaded to Cloudflare R2: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error('❌ Failed to upload buffer to Cloudflare R2:', err);
    return null;
  }
}

/**
 * Downloads an image from a remote URL (like Unsplash) and uploads it to Cloudflare R2
 * to ensure persistent hosting under your custom R2 CDN.
 * Returns the Cloudflare CDN URL, or the fallback original URL if anything fails.
 */
export async function mirrorImageToR2(
  imageUrl: string,
  slug: string
): Promise<string> {
  if (!imageUrl) return imageUrl;

  // If already on Cloudflare CDN, no need to re-upload
  if (R2_PUBLIC_CDN && imageUrl.startsWith(R2_PUBLIC_CDN)) {
    return imageUrl;
  }

  const client = getR2Client();
  if (!client) {
    console.warn('⚠️ Cloudflare R2 not configured; using original image URL.');
    return imageUrl;
  }

  try {
    console.log(`📥 Downloading image for R2 mirror: ${imageUrl}`);
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Failed to download remote image: ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    
    // Determine extension
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('gif')) ext = 'gif';

    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 50) || 'cover';
    const key = `blog-covers/${safeSlug}-${Date.now()}.${ext}`;

    const cdnUrl = await uploadBufferToR2(buffer, key, contentType);
    return cdnUrl || imageUrl;
  } catch (err) {
    console.warn('⚠️ Cloudflare R2 mirror upload failed, using original URL:', err);
    return imageUrl;
  }
}
