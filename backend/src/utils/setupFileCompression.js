import zlib from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);
const brotliCompressAsync = promisify(zlib.brotliCompress);
const brotliDecompressAsync = promisify(zlib.brotliDecompress);

/** Cloudinary free tier raw upload limit (bytes). Override with CLOUDINARY_SETUP_MAX_UPLOAD_BYTES if your plan differs. */
export function getCloudinarySetupMaxBytes() {
  const n = Number(process.env.CLOUDINARY_SETUP_MAX_UPLOAD_BYTES);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return 10 * 1024 * 1024; // 10 MiB — matches typical free-tier error (10485760)
}

/** Setup types that may upload a binary installer. */
const COMPRESSIBLE_SETUP_TYPES = new Set(["apk", "exe", "windows", "ios", "other"]);

/**
 * Pick gzip and/or Brotli so the payload stays under Cloudinary's per-upload cap when possible.
 * Brotli often beats gzip on APKs enough to cross the 10 MiB line when gzip does not.
 *
 * @returns {{ buffer: Buffer, setupFileEncoding: 'none'|'gzip'|'brotli', setupFileGzipped: boolean }}
 */
export async function prepareSetupFileForUpload(buffer, typeKey) {
  const maxBytes = getCloudinarySetupMaxBytes();
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { buffer, setupFileEncoding: "none", setupFileGzipped: false };
  }
  const t = String(typeKey || "").toLowerCase();
  if (!COMPRESSIBLE_SETUP_TYPES.has(t)) {
    if (buffer.length > maxBytes) {
      const err = new Error(
        `File is ${buffer.length} bytes; Cloudinary allows up to ${maxBytes} bytes per upload on your plan.`
      );
      err.code = "SETUP_FILE_TOO_LARGE";
      throw err;
    }
    return { buffer, setupFileEncoding: "none", setupFileGzipped: false };
  }

  /** @type {{ buf: Buffer, encoding: 'none'|'gzip'|'brotli' }[]} */
  const candidates = [{ buf: buffer, encoding: "none" }];

  try {
    const gz = await gzipAsync(buffer, { level: zlib.constants.Z_BEST_COMPRESSION });
    if (gz.length < buffer.length) {
      candidates.push({ buf: gz, encoding: "gzip" });
    }
  } catch {
    /* ignore */
  }

  try {
    const br = await brotliCompressAsync(buffer, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buffer.length,
      },
    });
    if (br.length < buffer.length) {
      candidates.push({ buf: br, encoding: "brotli" });
    }
  } catch {
    /* ignore — brotli may be unavailable in some builds */
  }

  const under = candidates.filter((c) => c.buf.length <= maxBytes);
  const pool = under.length ? under : candidates;
  const best = pool.reduce((a, b) => (a.buf.length <= b.buf.length ? a : b));

  if (best.buf.length > maxBytes) {
    const err = new Error(
      `After gzip and Brotli, the smallest payload is still ${best.buf.length} bytes (limit ${maxBytes} bytes for Cloudinary). Use a smaller build or upgrade Cloudinary.`
    );
    err.code = "SETUP_FILE_TOO_LARGE";
    throw err;
  }

  const setupFileEncoding = best.encoding;
  const setupFileGzipped = setupFileEncoding !== "none";
  return { buffer: best.buf, setupFileEncoding, setupFileGzipped };
}

export async function decompressSetupFileBuffer(buffer, setupFileEncoding, legacyGzipped) {
  if (!buffer || !Buffer.isBuffer(buffer)) return buffer;
  const enc =
    setupFileEncoding === "gzip" || setupFileEncoding === "brotli"
      ? setupFileEncoding
      : legacyGzipped
        ? "gzip"
        : "none";
  if (enc === "gzip") return gunzipAsync(buffer);
  if (enc === "brotli") return brotliDecompressAsync(buffer);
  return buffer;
}
