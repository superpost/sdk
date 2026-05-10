export async function processFile(file: any): Promise<File | Blob> {
  // If it's already a File or Blob, return it
  if (typeof Blob !== "undefined" && file instanceof Blob) {
    return file;
  }
  
  // Handle Buffer
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(file)) {
    return new Blob([file as any]);
  }

  // Handle string path (Node.js only)
  if (typeof file === "string") {
    let fs: any;
    let path: any;
    try {
      // Hide the import from static analyzers to prevent edge runtime build errors
      // Use dynamic strings so bundlers completely ignore it during static analysis
      const fsModuleName = "node:fs";
      const pathModuleName = "node:path";
      fs = await import(/* @vite-ignore */ /* webpackIgnore: true */ fsModuleName);
      path = await import(/* @vite-ignore */ /* webpackIgnore: true */ pathModuleName);
    } catch (error) {
      throw new Error(
        "File paths are only supported in Node.js environments. Please provide a File, Blob, or Buffer."
      );
    }

    const buffer = fs.readFileSync(file);
    const basename = path.basename(file);
    
    // In Node.js >= 20, File is globally available.
    // In earlier versions, we can use Blob and attach a name property.
    if (typeof File !== "undefined") {
      return new File([buffer], basename);
    }
    
    const blob = new Blob([buffer]);
    (blob as any).name = basename;
    return blob;
  }

  throw new Error("Unsupported file type. Must be File, Blob, Buffer, or string path.");
}

export async function buildFormData(fields: Record<string, any>): Promise<FormData> {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (key === "files" && Array.isArray(value)) {
      for (const file of value) {
        const processedFile = await processFile(file);
        // If it has a name property (either it's a File or a mock), append with name
        const fileName = (processedFile as any).name;
        if (fileName) {
          formData.append("files", processedFile, fileName);
        } else {
          formData.append("files", processedFile);
        }
      }
    } else if (key === "accounts" && Array.isArray(value)) {
      for (const account of value) {
        formData.append("accounts", account);
      }
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Blob)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}
