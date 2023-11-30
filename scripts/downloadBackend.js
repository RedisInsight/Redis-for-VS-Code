"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var https = require("https");
var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url_1 = require("url");
var cdnPath = process.env.RI_CDN_PATH;
var backendPath = path.join(__dirname, '..', 'dist', 'redis-backend');
var downloadBackend = function () { return __awaiter(void 0, void 0, void 0, function () {
    var redisInsightArchivePath, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!fs.existsSync(backendPath)) return [3 /*break*/, 1];
                console.debug('Backend folder already exists');
                return [3 /*break*/, 5];
            case 1:
                console.debug('Downloading and unpacking, it will takes some time (~15 min) - please be patient...');
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, downloadRedisBackendArchive(process.platform, backendPath)];
            case 3:
                redisInsightArchivePath = _a.sent();
                if (fs.existsSync(redisInsightArchivePath)) {
                    unzipRedisServer(redisInsightArchivePath, backendPath);
                    // Remove archive for non-windows platforms
                    if (process.platform !== 'win32')
                        fs.unlinkSync(redisInsightArchivePath);
                    console.debug('Done!');
                }
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                console.debug('Failed to download RedisInsight backend');
                fs.rmdir(backendPath, function () { });
                throw Error('Failed to download and unzip Redis backend');
            case 5: return [2 /*return*/];
        }
    });
}); };
function ensureFolderExists(loc) {
    if (!fs.existsSync(loc)) {
        var parent_1 = path.dirname(loc);
        if (parent_1) {
            ensureFolderExists(parent_1);
        }
        fs.mkdirSync(loc);
    }
}
function getDownloadUrl() {
    // Download is temporary available only for non-windows platforms
    if (process.platform !== 'win32') {
        return "".concat(cdnPath, "/RedisInsight-v2-web-").concat(process.platform, ".").concat(process.arch, ".tar.gz");
    }
    return path.join(__dirname, '..', 'backend_dist', 'redis-backend-win32-x64.zip');
}
function downloadRedisBackendArchive(platform, destDir) {
    return __awaiter(this, void 0, void 0, function () {
        var downloadUrl;
        return __generator(this, function (_a) {
            ensureFolderExists(destDir);
            downloadUrl = getDownloadUrl();
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var requestOptions = (0, url_1.parse)(downloadUrl);
                    // --- Current windows archive located inside of the app, no need to download --- //
                    if (process.platform !== 'win32') {
                        https.get(requestOptions, function (res) {
                            if (res.statusCode !== 200) {
                                reject(new Error('Failed to get RedisInsight backend archive location'));
                            }
                            // Expected that windows distribution package will be zipped
                            if (downloadUrl.endsWith('.zip')) {
                                var archivePath_1 = path.resolve(destDir, "redisinsight-backend-".concat(platform, ".zip"));
                                var outStream_1 = fs.createWriteStream(archivePath_1);
                                outStream_1.on('close', function () {
                                    resolve(archivePath_1);
                                });
                                https.get(downloadUrl, function (res) {
                                    res.pipe(outStream_1);
                                });
                            }
                            else { // Other non-windows distribution packages
                                var zipPath_1 = path.resolve(destDir, "redisinsight-backend-".concat(platform, ".tar.gz"));
                                var outStream_2 = fs.createWriteStream(zipPath_1);
                                https.get(downloadUrl, function (res) {
                                    res.pipe(outStream_2);
                                });
                                outStream_2.on('close', function () {
                                    resolve(zipPath_1);
                                });
                            }
                        });
                    }
                    else
                        resolve(downloadUrl);
                })];
        });
    });
}
function unzipRedisServer(redisInsideArchivePath, extractDir) {
    if (redisInsideArchivePath.endsWith('.zip')) {
        if (process.platform === 'win32') {
            cp.spawnSync('powershell.exe', [
                '-NoProfile',
                '-ExecutionPolicy', 'Bypass',
                '-NonInteractive',
                '-NoLogo',
                '-Command',
                "Microsoft.PowerShell.Archive\\Expand-Archive -Path \"".concat(redisInsideArchivePath, "\" -DestinationPath \"").concat(extractDir, "\""),
            ]);
        }
        else {
            cp.spawnSync('unzip', [redisInsideArchivePath, '-d', "".concat(extractDir)]);
        }
    }
    else {
        // tar does not create extractDir by default
        if (!fs.existsSync(extractDir)) {
            fs.mkdirSync(extractDir);
        }
        cp.spawnSync('tar', ['-xzf', redisInsideArchivePath, '-C', extractDir, '--strip-components', '2', 'api/dist']);
        // Temporary: there's no some dependencies in current dist's, starting re-install
        cp.spawnSync('yarn', ['--cwd', extractDir, 'install']);
    }
}
downloadBackend();
