import * as os from "os";
import { format } from "util";
import * as fs from "fs";
import { promises as fsPromises } from "fs";
import got from "got";
import * as pipe from "promisepipe";
import * as extract from "extract-zip";
import * as cpr from "cpr";
import * as mkdirp from "mkdirp";
import { Stream } from "stream";

// Windows archive name changed at r591479.
const revisionChange = 591479;

const enum Platform {
  LINUX = "linux",
  MAC = "mac",
  WIN_32 = "win32",
  WIN_64 = "win64",
}

const downloadURLs = {
  [Platform.LINUX]:
    "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/%d/%s.zip",
  [Platform.MAC]:
    "https://storage.googleapis.com/chromium-browser-snapshots/Mac/%d/%s.zip",
  [Platform.WIN_32]:
    "https://storage.googleapis.com/chromium-browser-snapshots/Win/%d/%s.zip",
  [Platform.WIN_64]:
    "https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/%d/%s.zip",
};

/*
 * - [x] check module cache
 * - [x] if exists, return
 * - [x] check global cache
 * - [x] if exists, copy and return
 * - [x] install into global cache
 * - [x] copy and return
 */
export async function downloadChromium({
  platform: platform = getCurrentPlatform(),
  revision: revision = "499413",
  log: log = false,
  installPath: installPath = `${__dirname}/.local-chromium`,
} = {}) {
  const moduleExecutablePath = getExecutablePath(
    installPath,
    platform,
    revision,
  );
  try {
    await fsPromises.stat(moduleExecutablePath);
    return moduleExecutablePath;
  } catch (_) {
    // Do nothing
  }

  const cacheRoot = `${os.homedir()}/.chromium-cache`;
  const globalExecutablePath = getExecutablePath(cacheRoot, platform, revision);
  try {
    await fsPromises.stat(globalExecutablePath);
    await copyCacheToModule(platform, revision, installPath);
    return moduleExecutablePath;
  } catch (_) {
    // Do nothing
  }

  const url = downloadUrl(platform, revision);

  try {
    await fsPromises.mkdir(cacheRoot);
  } catch (_) {
    // Do nothing
  }

  const folderPath = getFolderPath(cacheRoot, platform, revision);
  const zipPath = `${folderPath}.zip`;

  if (log) {
    process.stderr.write(`Downloading Chromium r${revision}...`);
  }
  await pipe(
    await get(url),
    fs.createWriteStream(zipPath),
  );

  await extract(zipPath, { dir: folderPath });

  await fsPromises.unlink(zipPath);

  await copyCacheToModule(platform, revision, installPath);

  if (log) {
    process.stderr.write("Done!\n");
  }
  return moduleExecutablePath;
}

function get(url: string): Stream {
  return got.stream(url);
}

function archiveName(platform: Platform, revision: string): string | null {
  switch (platform) {
    case Platform.LINUX:
      return "chrome-linux";
    case Platform.MAC:
      return "chrome-mac";
    case Platform.WIN_32:
    case Platform.WIN_64:
      return parseInt(revision, 10) > revisionChange ? "chrome-win" : "chrome-win32";
    default:
      return null;
  }
}

function downloadUrl(platform: Platform, revision: string): string {
  return format(
    downloadURLs[platform],
    revision,
    archiveName(platform, revision),
  );
}

function getCurrentPlatform(): Platform {
  const currentOsPlatform = os.platform();
  if (currentOsPlatform === "darwin") {
    return Platform.MAC;
  }
  if (currentOsPlatform === "linux") {
    return Platform.LINUX;
  }
  if (currentOsPlatform === "win32") {
    if (os.arch() === "x64") {
      return Platform.WIN_64;
    } else {
      return Platform.WIN_32;
    }
  }
  throw new Error(`Current system platform not supported: ${currentOsPlatform}`);
}

function getFolderPath(root: string, platform: Platform, revision: string) {
  return  `${root}/chromium-${platform}-${revision}`;
}

function getExecutablePath(root: string, platform: Platform, revision: string) {
  const folder = getFolderPath(root, platform, revision);
  const archiveFolder = archiveName(platform, revision);

  if (platform === Platform.MAC) {
    return `${folder}/${archiveFolder}/Chromium.app/Contents/MacOS/Chromium`;
  }
  if (platform === Platform.LINUX) {
    return `${folder}/${archiveFolder}/chrome`;
  }

  return `${folder}/${archiveFolder}/chrome.exe`;
}

async function copyCacheToModule(platform: Platform, revision: string, installPath: string) {
  const cacheRoot = `${os.homedir()}/.chromium-cache`;
  const osCachePath = getFolderPath(cacheRoot, platform, revision);
  const osInstallPath = getFolderPath(installPath, platform, revision);
  await mkdirp(getFolderPath(installPath, platform, revision));
  return new Promise((resolve, reject) => {
    cpr(osCachePath, osInstallPath, { deleteFirst: true, confirm: true }, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}
