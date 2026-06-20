// File storage adapter. Free default = local disk under public/uploads (served
// statically by Next in dev). Azure later: add an AzureBlobStorage provider and
// select it here; callers and the upload route stay unchanged.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface StoredFile {
  url: string;
  key: string;
}

export interface StorageProvider {
  readonly name: string;
  put(key: string, data: Buffer, contentType: string): Promise<StoredFile>;
}

class LocalStorage implements StorageProvider {
  readonly name = 'local';
  async put(key: string, data: Buffer): Promise<StoredFile> {
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, key), data);
    return { url: `/uploads/${key}`, key };
  }
}

let provider: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (provider) return provider;
  // Azure later: if (process.env.AZURE_STORAGE_CONNECTION_STRING) provider = new AzureBlobStorage(...)
  provider = new LocalStorage();
  return provider;
}
