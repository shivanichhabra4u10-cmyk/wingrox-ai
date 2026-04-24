/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.controller.ts":
/*!*******************************!*\
  !*** ./src/app.controller.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./src/app.service.ts");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHealth() {
        return this.appService.getHealth();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./src/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./src/app.service.ts");
const auth_module_1 = __webpack_require__(/*! ./modules/auth/auth.module */ "./src/modules/auth/auth.module.ts");
const users_module_1 = __webpack_require__(/*! ./modules/users/users.module */ "./src/modules/users/users.module.ts");
const prisma_service_1 = __webpack_require__(/*! ./common/prisma.service */ "./src/common/prisma.service.ts");
const dashboard_module_1 = __webpack_require__(/*! ./modules/dashboard/dashboard.module */ "./src/modules/dashboard/dashboard.module.ts");
const accounts_module_1 = __webpack_require__(/*! ./modules/accounts/accounts.module */ "./src/modules/accounts/accounts.module.ts");
const reports_module_1 = __webpack_require__(/*! ./modules/reports/reports.module */ "./src/modules/reports/reports.module.ts");
const jwtExpiration = process.env.JWT_EXPIRATION ?? '24h';
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: { expiresIn: jwtExpiration },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            dashboard_module_1.DashboardModule,
            accounts_module_1.AccountsModule,
            reports_module_1.ReportsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], AppModule);


/***/ }),

/***/ "./src/app.service.ts":
/*!****************************!*\
  !*** ./src/app.service.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let AppService = class AppService {
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'WinGroX AI API',
            version: '0.1.0',
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),

/***/ "./src/common/decorators/user.decorator.ts":
/*!*************************************************!*\
  !*** ./src/common/decorators/user.decorator.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
/**
 * @User() Decorator - Extract user from request
 * Usage: getUserProfile(@User() user) { ... }
 */
exports.User = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});


/***/ }),

/***/ "./src/common/guards/jwt.guard.ts":
/*!****************************************!*\
  !*** ./src/common/guards/jwt.guard.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const replay_protection_service_1 = __webpack_require__(/*! ../services/replay-protection.service */ "./src/common/services/replay-protection.service.ts");
/**
 * JWT Guard - Protects endpoints with JWT authentication
 * Validates the Authorization Bearer token
 */
let JwtGuard = class JwtGuard {
    constructor(jwtService, replayProtectionService) {
        this.jwtService = jwtService;
        this.replayProtectionService = replayProtectionService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        const queryToken = typeof request.query?.accessToken === 'string' ? request.query.accessToken : undefined;
        const streamToken = typeof request.query?.streamToken === 'string' ? request.query.streamToken : undefined;
        const streamNonce = typeof request.query?.nonce === 'string' ? request.query.nonce : undefined;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice('Bearer '.length)
            : streamToken ?? queryToken;
        if (!token) {
            throw new common_1.UnauthorizedException('Missing or invalid authorization token');
        }
        try {
            const payload = streamToken
                ? this.jwtService.verify(token, {
                    secret: process.env.STREAM_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key',
                    audience: 'reports-sse',
                })
                : this.jwtService.verify(token);
            if (streamToken && payload?.type !== 'stream') {
                throw new common_1.UnauthorizedException('Invalid stream token');
            }
            if (streamToken) {
                if (!payload?.jti || typeof payload.jti !== 'string') {
                    throw new common_1.UnauthorizedException('Invalid stream token identifier');
                }
                if (!payload?.nonce || typeof payload.nonce !== 'string' || payload.nonce !== streamNonce) {
                    throw new common_1.UnauthorizedException('Invalid stream nonce');
                }
                const ttlSeconds = typeof payload.exp === 'number'
                    ? Math.max(1, Math.floor(payload.exp - Date.now() / 1000))
                    : 120;
                const accepted = await this.replayProtectionService.consumeStreamTokenJti(payload.jti, ttlSeconds);
                if (!accepted) {
                    throw new common_1.UnauthorizedException('Stream token replay detected');
                }
            }
            request.user = payload;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.JwtGuard = JwtGuard;
exports.JwtGuard = JwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof replay_protection_service_1.ReplayProtectionService !== "undefined" && replay_protection_service_1.ReplayProtectionService) === "function" ? _b : Object])
], JwtGuard);


/***/ }),

/***/ "./src/common/guards/roles.guard.ts":
/*!******************************************!*\
  !*** ./src/common/guards/roles.guard.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const common_2 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
exports.ROLES_KEY = 'roles';
/**
 * Roles Decorator - Mark which roles can access an endpoint
 * Usage: @Roles('admin', 'manager')
 */
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
/**
 * RBAC Guard - Role-based access control
 * Checks if user's role matches allowed roles
 */
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(exports.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true; // No role requirement
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_2.ForbiddenException('User not authenticated');
        }
        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new common_2.ForbiddenException(`User role '${user.role}' does not have access to this resource`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ }),

/***/ "./src/common/prisma.service.ts":
/*!**************************************!*\
  !*** ./src/common/prisma.service.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);


/***/ }),

/***/ "./src/common/services/replay-protection.service.ts":
/*!**********************************************************!*\
  !*** ./src/common/services/replay-protection.service.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ReplayProtectionService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReplayProtectionService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const ioredis_1 = __importDefault(__webpack_require__(/*! ioredis */ "ioredis"));
let ReplayProtectionService = ReplayProtectionService_1 = class ReplayProtectionService {
    constructor() {
        this.logger = new common_1.Logger(ReplayProtectionService_1.name);
        this.consumedJti = new Map();
        this.redisUrl = process.env.REDIS_URL;
        this.redisPrefix = process.env.REDIS_PREFIX || 'wingrox';
        this.redisClient = null;
        this.redisAvailable = false;
        this.redisConnectAttempted = false;
    }
    async ensureRedisConnection() {
        if (this.redisConnectAttempted || !this.redisUrl) {
            return;
        }
        this.redisConnectAttempted = true;
        try {
            this.redisClient = new ioredis_1.default(this.redisUrl, {
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                enableOfflineQueue: false,
            });
            await this.redisClient.connect();
            this.redisAvailable = true;
            this.logger.log('Replay protection is using Redis backend');
        }
        catch {
            this.redisAvailable = false;
            this.redisClient = null;
            this.logger.warn('Redis unavailable, replay protection falling back to in-memory store');
        }
    }
    pruneLocalConsumedJti() {
        const now = Date.now();
        for (const [jti, expMs] of this.consumedJti.entries()) {
            if (expMs <= now) {
                this.consumedJti.delete(jti);
            }
        }
    }
    async consumeStreamTokenJti(jti, ttlSeconds) {
        await this.ensureRedisConnection();
        if (this.redisAvailable && this.redisClient) {
            const key = `${this.redisPrefix}:reports:stream-jti:${jti}`;
            try {
                const response = await this.redisClient.set(key, '1', 'EX', Math.max(1, ttlSeconds), 'NX');
                return response === 'OK';
            }
            catch {
                this.redisAvailable = false;
                this.logger.warn('Redis replay write failed, using in-memory fallback for this instance');
            }
        }
        this.pruneLocalConsumedJti();
        if (this.consumedJti.has(jti)) {
            return false;
        }
        this.consumedJti.set(jti, Date.now() + Math.max(1, ttlSeconds) * 1000);
        return true;
    }
    async onModuleDestroy() {
        if (this.redisClient) {
            await this.redisClient.quit();
        }
    }
};
exports.ReplayProtectionService = ReplayProtectionService;
exports.ReplayProtectionService = ReplayProtectionService = ReplayProtectionService_1 = __decorate([
    (0, common_1.Injectable)()
], ReplayProtectionService);


/***/ }),

/***/ "./src/config/index.ts":
/*!*****************************!*\
  !*** ./src/config/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apiConfig = exports.corsConfig = exports.dbConfig = exports.jwtConfig = void 0;
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
    refreshExpiresIn: '7d',
};
exports.dbConfig = {
    url: process.env.DATABASE_URL || 'file:./dev.db',
};
exports.corsConfig = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
};
exports.apiConfig = {
    prefix: process.env.API_PREFIX || 'api',
    port: parseInt(process.env.PORT || '3001', 10),
};


/***/ }),

/***/ "./src/modules/accounts/accounts.controller.ts":
/*!*****************************************************!*\
  !*** ./src/modules/accounts/accounts.controller.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const user_decorator_1 = __webpack_require__(/*! ../../common/decorators/user.decorator */ "./src/common/decorators/user.decorator.ts");
const jwt_guard_1 = __webpack_require__(/*! ../../common/guards/jwt.guard */ "./src/common/guards/jwt.guard.ts");
const accounts_service_1 = __webpack_require__(/*! ./accounts.service */ "./src/modules/accounts/accounts.service.ts");
const accounts_dto_1 = __webpack_require__(/*! ./accounts.dto */ "./src/modules/accounts/accounts.dto.ts");
let AccountsController = class AccountsController {
    constructor(accountsService) {
        this.accountsService = accountsService;
    }
    async list(userId) {
        return {
            success: true,
            data: await this.accountsService.listByOwner(userId),
            timestamp: new Date().toISOString(),
        };
    }
    async get(userId, id) {
        return {
            success: true,
            data: await this.accountsService.getById(userId, id),
            timestamp: new Date().toISOString(),
        };
    }
    async create(userId, payload) {
        try {
            const dto = accounts_dto_1.CreateAccountSchema.parse(payload);
            return {
                success: true,
                data: await this.accountsService.create(userId, dto),
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'Invalid payload');
        }
    }
    async update(userId, id, payload) {
        try {
            const dto = accounts_dto_1.UpdateAccountSchema.parse(payload);
            return {
                success: true,
                data: await this.accountsService.update(userId, id, dto),
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'Invalid payload');
        }
    }
    async remove(userId, id) {
        return {
            success: true,
            data: await this.accountsService.remove(userId, id),
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AccountsController = AccountsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List current user accounts' }),
    __param(0, (0, user_decorator_1.User)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account by id' }),
    __param(0, (0, user_decorator_1.User)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create account' }),
    __param(0, (0, user_decorator_1.User)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update account' }),
    __param(0, (0, user_decorator_1.User)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete account' }),
    __param(0, (0, user_decorator_1.User)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "remove", null);
exports.AccountsController = AccountsController = __decorate([
    (0, swagger_1.ApiTags)('accounts'),
    (0, common_1.Controller)('accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof accounts_service_1.AccountsService !== "undefined" && accounts_service_1.AccountsService) === "function" ? _a : Object])
], AccountsController);


/***/ }),

/***/ "./src/modules/accounts/accounts.dto.ts":
/*!**********************************************!*\
  !*** ./src/modules/accounts/accounts.dto.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateAccountSchema = exports.CreateAccountSchema = void 0;
const zod_1 = __webpack_require__(/*! zod */ "zod");
exports.CreateAccountSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    legalName: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional(),
    country: zod_1.z.string().min(2),
    industry: zod_1.z.string().min(2),
    stage: zod_1.z.string().min(2),
    annualRevenueUsd: zod_1.z.number().nonnegative().optional(),
    description: zod_1.z.string().optional(),
});
exports.UpdateAccountSchema = exports.CreateAccountSchema.partial();


/***/ }),

/***/ "./src/modules/accounts/accounts.module.ts":
/*!*************************************************!*\
  !*** ./src/modules/accounts/accounts.module.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const accounts_controller_1 = __webpack_require__(/*! ./accounts.controller */ "./src/modules/accounts/accounts.controller.ts");
const accounts_service_1 = __webpack_require__(/*! ./accounts.service */ "./src/modules/accounts/accounts.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../common/prisma.service */ "./src/common/prisma.service.ts");
const jwt_guard_1 = __webpack_require__(/*! ../../common/guards/jwt.guard */ "./src/common/guards/jwt.guard.ts");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const replay_protection_service_1 = __webpack_require__(/*! ../../common/services/replay-protection.service */ "./src/common/services/replay-protection.service.ts");
let AccountsModule = class AccountsModule {
};
exports.AccountsModule = AccountsModule;
exports.AccountsModule = AccountsModule = __decorate([
    (0, common_1.Module)({
        controllers: [accounts_controller_1.AccountsController],
        providers: [accounts_service_1.AccountsService, prisma_service_1.PrismaService, jwt_guard_1.JwtGuard, jwt_1.JwtService, replay_protection_service_1.ReplayProtectionService],
    })
], AccountsModule);


/***/ }),

/***/ "./src/modules/accounts/accounts.service.ts":
/*!**************************************************!*\
  !*** ./src/modules/accounts/accounts.service.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/prisma.service */ "./src/common/prisma.service.ts");
let AccountsService = class AccountsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listByOwner(ownerId) {
        return this.prisma.account.findMany({
            where: { ownerId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(ownerId, id) {
        const account = await this.prisma.account.findFirst({
            where: { id, ownerId, deletedAt: null },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async create(ownerId, dto) {
        return this.prisma.account.create({
            data: {
                ...dto,
                annualRevenueUsd: dto.annualRevenueUsd,
                ownerId,
            },
        });
    }
    async update(ownerId, id, dto) {
        await this.getById(ownerId, id);
        return this.prisma.account.update({
            where: { id },
            data: dto,
        });
    }
    async remove(ownerId, id) {
        await this.getById(ownerId, id);
        await this.prisma.account.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { deleted: true };
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AccountsService);


/***/ }),

/***/ "./src/modules/auth/auth.controller.ts":
/*!*********************************************!*\
  !*** ./src/modules/auth/auth.controller.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./src/modules/auth/auth.service.ts");
const auth_dto_1 = __webpack_require__(/*! ./auth.dto */ "./src/modules/auth/auth.dto.ts");
/**
 * Auth Controller
 * Endpoints: login, signup, refresh token
 */
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(dto) {
        try {
            const validated = auth_dto_1.LoginDTOSchema.parse(dto);
            const result = await this.authService.login(validated);
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async signup(dto) {
        try {
            const validated = auth_dto_1.SignupDTOSchema.parse(dto);
            const result = await this.authService.signup(validated);
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async refresh(dto) {
        try {
            const validated = auth_dto_1.RefreshTokenDTOSchema.parse(dto);
            const result = await this.authService.refreshToken(validated.refreshToken);
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        schema: {
            example: {
                success: true,
                data: {
                    accessToken: 'eyJhbGc...',
                    refreshToken: 'eyJhbGc...',
                    expiresIn: 86400,
                    user: { id: '...', email: '...', name: '...', role: 'USER' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid credentials',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('signup'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new account' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Account created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input or email already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid refresh token',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),

/***/ "./src/modules/auth/auth.dto.ts":
/*!**************************************!*\
  !*** ./src/modules/auth/auth.dto.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthResponseSchema = exports.RefreshTokenDTOSchema = exports.SignupDTOSchema = exports.LoginDTOSchema = void 0;
const zod_1 = __webpack_require__(/*! zod */ "zod");
// Auth DTOs with Zod validation
exports.LoginDTOSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.SignupDTOSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
});
exports.RefreshTokenDTOSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
// Response DTO
exports.AuthResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    expiresIn: zod_1.z.number(),
    user: zod_1.z.object({
        id: zod_1.z.string(),
        email: zod_1.z.string(),
        name: zod_1.z.string(),
        role: zod_1.z.string(),
    }),
});


/***/ }),

/***/ "./src/modules/auth/auth.module.ts":
/*!*****************************************!*\
  !*** ./src/modules/auth/auth.module.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./src/modules/auth/auth.controller.ts");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./src/modules/auth/auth.service.ts");
const config_1 = __webpack_require__(/*! ../../config */ "./src/config/index.ts");
const prisma_service_1 = __webpack_require__(/*! ../../common/prisma.service */ "./src/common/prisma.service.ts");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: config_1.jwtConfig.secret,
                signOptions: { expiresIn: config_1.jwtConfig.expiresIn },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, prisma_service_1.PrismaService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),

/***/ "./src/modules/auth/auth.service.ts":
/*!******************************************!*\
  !*** ./src/modules/auth/auth.service.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const bcryptjs_1 = __webpack_require__(/*! bcryptjs */ "bcryptjs");
const prisma_service_1 = __webpack_require__(/*! ../../common/prisma.service */ "./src/common/prisma.service.ts");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
/**
 * Auth Service
 * Handles authentication logic: login, signup, token refresh
 */
let AuthService = class AuthService {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    /**
     * Sign up a new user
     */
    async signup(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: dto.email, deletedAt: null },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already in use');
        }
        const passwordHash = await this.hashPassword(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: passwordHash,
                role: client_1.UserRole.USER,
            },
        });
        const tokens = this.generateTokens(user.id, user.email, user.role);
        await this.prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                expiresAt: this.refreshExpiryDate(),
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'SIGNUP',
                resource: 'USER',
                resourceId: user.id,
            },
        });
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 24 * 60 * 60,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
    /**
     * Login user with email and password
     */
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email, deletedAt: null },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isMatch = await this.comparePassword(dto.password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = this.generateTokens(user.id, user.email, user.role);
        await this.prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId: user.id,
                expiresAt: this.refreshExpiryDate(),
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                resource: 'USER',
                resourceId: user.id,
            },
        });
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 24 * 60 * 60,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken) {
        try {
            const stored = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            });
            if (!stored || stored.expiresAt.getTime() < Date.now()) {
                throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
            }
            const decoded = this.jwtService.verify(refreshToken);
            const newAccessToken = this.jwtService.sign({
                sub: decoded.sub,
                email: decoded.email,
                role: decoded.role,
            }, { expiresIn: '24h' });
            return {
                accessToken: newAccessToken,
                expiresIn: 24 * 60 * 60, // 24 hours in seconds
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    /**
     * Hash password with bcryptjs
     */
    async hashPassword(password) {
        return (0, bcryptjs_1.hash)(password, 10);
    }
    /**
     * Compare plaintext password with hash
     */
    async comparePassword(password, hash) {
        return (0, bcryptjs_1.compare)(password, hash);
    }
    /**
     * Generate JWT tokens
     */
    generateTokens(userId, email, role) {
        const accessToken = this.jwtService.sign({
            sub: userId,
            email,
            role,
        }, { expiresIn: '24h' });
        const refreshToken = this.jwtService.sign({
            sub: userId,
            email,
            role,
            type: 'refresh',
        }, { expiresIn: '7d' });
        return {
            accessToken,
            refreshToken,
        };
    }
    refreshExpiryDate() {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], AuthService);


/***/ }),

/***/ "./src/modules/dashboard/dashboard.controller.ts":
/*!*******************************************************!*\
  !*** ./src/modules/dashboard/dashboard.controller.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DashboardController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const dashboard_service_1 = __webpack_require__(/*! ./dashboard.service */ "./src/modules/dashboard/dashboard.service.ts");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getOverview() {
        return {
            success: true,
            data: this.dashboardService.getOverview(),
            timestamp: new Date().toISOString(),
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard overview data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getOverview", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [typeof (_a = typeof dashboard_service_1.DashboardService !== "undefined" && dashboard_service_1.DashboardService) === "function" ? _a : Object])
], DashboardController);


/***/ }),

/***/ "./src/modules/dashboard/dashboard.module.ts":
/*!***************************************************!*\
  !*** ./src/modules/dashboard/dashboard.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DashboardModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const dashboard_controller_1 = __webpack_require__(/*! ./dashboard.controller */ "./src/modules/dashboard/dashboard.controller.ts");
const dashboard_service_1 = __webpack_require__(/*! ./dashboard.service */ "./src/modules/dashboard/dashboard.service.ts");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
    })
], DashboardModule);


/***/ }),

/***/ "./src/modules/dashboard/dashboard.service.ts":
/*!****************************************************!*\
  !*** ./src/modules/dashboard/dashboard.service.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DashboardService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let DashboardService = class DashboardService {
    getOverview() {
        return {
            greeting: 'Welcome back, Founder',
            stage: 'Experimenter',
            metrics: [
                { value: '64', label: 'Twin Score', variant: 'accent' },
                { value: 'Experimenter', label: 'Cluster Stage', variant: 'accent' },
                { value: '42', label: 'Matches', variant: 'good' },
                { value: 'EUR 180K', label: 'Pipeline Est.' },
                { value: 'Demand', label: 'Primary Constraint', variant: 'alert' },
            ],
            readiness: [
                { name: 'Demand', score: 58, color: 'var(--rose)' },
                { name: 'Strategy', score: 62, color: 'var(--amber)' },
                { name: 'Competition', score: 60, color: 'var(--amber)' },
                { name: 'Economics', score: 66, color: 'var(--gold)' },
                { name: 'Customer', score: 59, color: 'var(--rose)' },
                { name: 'Execution', score: 70, color: 'var(--sage)' },
            ],
            actions: [
                { icon: '🤝', title: 'Review 42 Matches', description: 'Book Discovery Call', href: '/dashboard/matches' },
                { icon: '📊', title: 'Model Revenue', description: '+2x scenario', href: '/dashboard/simulator' },
                { icon: '🌍', title: 'Enter Germany', description: 'Top-ranked country', href: '/dashboard/expansion' },
                { icon: '📚', title: 'Read Playbook', description: 'Distribution partnerships', href: '/dashboard/hub' },
            ],
            feed: [
                {
                    type: 'insight',
                    title: '3 new playbooks matched to your GTM needs',
                    description: 'Distribution-led entry for industrial SaaS in Germany and 2 others just published in the Intelligence Hub.',
                    time: '15 minutes ago',
                    source: 'Intelligence Hub',
                },
                {
                    type: 'match',
                    title: '7 new matches added in last 48 hours',
                    description: 'Including 2 Tier-1 VCs in London and 3 industrial distributors in DACH region.',
                    time: '2 hours ago',
                    source: 'Match Engine',
                },
                {
                    type: 'milestone',
                    title: 'You are now expansion-ready for Netherlands',
                    description: 'Your recent answers unlocked Netherlands as a viable secondary entry market.',
                    time: 'Yesterday',
                    source: 'Expansion Engine',
                },
                {
                    type: 'alert',
                    title: 'Risk alert: Demand pipeline below threshold',
                    description: 'Your demand score of 58 is the primary blocker to first deal. Run 15 structured EU prospect calls in 30 days.',
                    time: 'Yesterday',
                    source: 'AI Advisor',
                },
            ],
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)()
], DashboardService);


/***/ }),

/***/ "./src/modules/reports/reports.controller.ts":
/*!***************************************************!*\
  !*** ./src/modules/reports/reports.controller.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const express_1 = __webpack_require__(/*! express */ "express");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
const jwt_guard_1 = __webpack_require__(/*! ../../common/guards/jwt.guard */ "./src/common/guards/jwt.guard.ts");
const reports_dto_1 = __webpack_require__(/*! ./reports.dto */ "./src/modules/reports/reports.dto.ts");
const reports_service_1 = __webpack_require__(/*! ./reports.service */ "./src/modules/reports/reports.service.ts");
const user_decorator_1 = __webpack_require__(/*! ../../common/decorators/user.decorator */ "./src/common/decorators/user.decorator.ts");
let ReportsController = class ReportsController {
    constructor(reportsService, jwtService) {
        this.reportsService = reportsService;
        this.jwtService = jwtService;
    }
    createStreamToken(user) {
        const nonce = (0, crypto_1.randomUUID)();
        const jti = (0, crypto_1.randomUUID)();
        const token = this.jwtService.sign({
            sub: user.sub,
            email: user.email,
            role: user.role,
            type: 'stream',
            nonce,
            jti,
        }, {
            expiresIn: '2m',
            audience: 'reports-sse',
            secret: process.env.STREAM_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key',
        });
        return {
            success: true,
            data: {
                streamToken: token,
                nonce,
                expiresInSeconds: 120,
            },
            timestamp: new Date().toISOString(),
        };
    }
    getSummary(range, country, industry, stage, page, limit) {
        const parsed = reports_dto_1.ReportRangeSchema.safeParse({
            range: range ?? '30d',
            country,
            industry,
            stage,
            page: page ?? '1',
            limit: limit ?? '30',
        });
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid range');
        }
        return {
            success: true,
            data: this.reportsService.getSummary(parsed.data),
            timestamp: new Date().toISOString(),
        };
    }
    exportCsv(range, country, industry, stage, page, limit, res) {
        const parsed = reports_dto_1.ReportRangeSchema.safeParse({
            range: range ?? '30d',
            country,
            industry,
            stage,
            page: page ?? '1',
            limit: limit ?? '30',
        });
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid range');
        }
        const summary = this.reportsService.getSummary(parsed.data);
        const csv = this.reportsService.toCsv(summary);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="wingrox-report-${parsed.data.range}.csv"`);
        res.send(csv);
    }
    async exportPdf(range, country, industry, stage, page, limit, res) {
        const parsed = reports_dto_1.ReportRangeSchema.safeParse({
            range: range ?? '30d',
            country,
            industry,
            stage,
            page: page ?? '1',
            limit: limit ?? '30',
        });
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid range');
        }
        const summary = this.reportsService.getSummary(parsed.data);
        const pdf = await this.reportsService.toPdfBuffer(summary);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="wingrox-report-${parsed.data.range}.pdf"`);
        res.send(pdf);
    }
    getSegments(range, country, industry, stage) {
        const parsed = reports_dto_1.ReportRangeSchema.safeParse({
            range: range ?? '30d',
            country,
            industry,
            stage,
            page: '1',
            limit: '30',
        });
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid report query');
        }
        return {
            success: true,
            data: this.reportsService.getSegments(parsed.data),
            timestamp: new Date().toISOString(),
        };
    }
    streamRealtime(once) {
        const stream$ = (0, rxjs_1.interval)(5000).pipe((0, rxjs_1.startWith)(0), (0, rxjs_1.map)((tick) => {
            const payload = {
                type: tick === 0 ? 'heartbeat' : 'metric-update',
                ts: new Date().toISOString(),
                data: tick === 0
                    ? { status: 'connected' }
                    : {
                        pipelineEur: 180000 + Math.floor(Math.random() * 3000),
                        matches: 42 + Math.floor(Math.random() * 3),
                    },
            };
            return {
                data: payload,
            };
        }));
        return once === '1' ? stream$.pipe((0, rxjs_1.take)(1)) : stream$;
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('stream-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Create short-lived token for reports SSE stream' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "createStreamToken", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reporting summary and trend points' }),
    (0, swagger_1.ApiQuery)({ name: 'range', required: false, enum: ['7d', '30d', '90d'] }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'industry', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'stage', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('range')),
    __param(1, (0, common_1.Query)('country')),
    __param(2, (0, common_1.Query)('industry')),
    __param(3, (0, common_1.Query)('stage')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export report as CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'range', required: false, enum: ['7d', '30d', '90d'] }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'industry', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'stage', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiProduces)('text/csv'),
    __param(0, (0, common_1.Query)('range')),
    __param(1, (0, common_1.Query)('country')),
    __param(2, (0, common_1.Query)('industry')),
    __param(3, (0, common_1.Query)('stage')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Export report as PDF' }),
    (0, swagger_1.ApiQuery)({ name: 'range', required: false, enum: ['7d', '30d', '90d'] }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'industry', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'stage', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiProduces)('application/pdf'),
    __param(0, (0, common_1.Query)('range')),
    __param(1, (0, common_1.Query)('country')),
    __param(2, (0, common_1.Query)('industry')),
    __param(3, (0, common_1.Query)('stage')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, typeof (_d = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Get)('segments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get segmented reporting analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'range', required: false, enum: ['7d', '30d', '90d'] }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'industry', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'stage', required: false, type: String }),
    __param(0, (0, common_1.Query)('range')),
    __param(1, (0, common_1.Query)('country')),
    __param(2, (0, common_1.Query)('industry')),
    __param(3, (0, common_1.Query)('stage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSegments", null);
__decorate([
    (0, common_1.Sse)('realtime'),
    (0, swagger_1.ApiOperation)({ summary: 'Realtime report updates via server-sent events' }),
    __param(0, (0, common_1.Query)('once')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_e = typeof rxjs_1.Observable !== "undefined" && rxjs_1.Observable) === "function" ? _e : Object)
], ReportsController.prototype, "streamRealtime", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof reports_service_1.ReportsService !== "undefined" && reports_service_1.ReportsService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object])
], ReportsController);


/***/ }),

/***/ "./src/modules/reports/reports.dto.ts":
/*!********************************************!*\
  !*** ./src/modules/reports/reports.dto.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportRangeSchema = void 0;
const zod_1 = __webpack_require__(/*! zod */ "zod");
exports.ReportRangeSchema = zod_1.z.object({
    range: zod_1.z.enum(['7d', '30d', '90d']).default('30d'),
    country: zod_1.z.string().trim().min(2).optional(),
    industry: zod_1.z.string().trim().min(2).optional(),
    stage: zod_1.z.string().trim().min(2).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(200).default(30),
});


/***/ }),

/***/ "./src/modules/reports/reports.module.ts":
/*!***********************************************!*\
  !*** ./src/modules/reports/reports.module.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const jwt_guard_1 = __webpack_require__(/*! ../../common/guards/jwt.guard */ "./src/common/guards/jwt.guard.ts");
const replay_protection_service_1 = __webpack_require__(/*! ../../common/services/replay-protection.service */ "./src/common/services/replay-protection.service.ts");
const reports_controller_1 = __webpack_require__(/*! ./reports.controller */ "./src/modules/reports/reports.controller.ts");
const reports_service_1 = __webpack_require__(/*! ./reports.service */ "./src/modules/reports/reports.service.ts");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService, jwt_guard_1.JwtGuard, jwt_1.JwtService, replay_protection_service_1.ReplayProtectionService],
    })
], ReportsModule);


/***/ }),

/***/ "./src/modules/reports/reports.service.ts":
/*!************************************************!*\
  !*** ./src/modules/reports/reports.service.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReportsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const pdfkit_1 = __importDefault(__webpack_require__(/*! pdfkit */ "pdfkit"));
let ReportsService = class ReportsService {
    constructor() {
        this.cacheTtlMs = 30_000;
        this.summaryCache = new Map();
        this.segmentCache = new Map();
    }
    getSummary(input) {
        const { range, country, industry, stage, page, limit } = input;
        const key = JSON.stringify({ range, country, industry, stage, page, limit });
        const cached = this.summaryCache.get(key);
        if (cached && Date.now() - cached.ts < this.cacheTtlMs) {
            return cached.data;
        }
        const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
        const today = new Date();
        const filterBoost = (country ? 1 : 0) + (industry ? 1 : 0) + (stage ? 1 : 0);
        const allTrend = Array.from({ length: days }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (days - i - 1));
            return {
                date: d.toISOString().slice(0, 10),
                pipeline: 120000 + i * 1700 + filterBoost * 2400,
                matches: 18 + Math.floor(i / 2) + filterBoost,
                conversionRate: Number((4.2 + i * 0.08 + filterBoost * 0.12).toFixed(2)),
            };
        });
        const start = (page - 1) * limit;
        const trend = allTrend.slice(start, start + limit);
        const pipelineEur = allTrend[allTrend.length - 1]?.pipeline ?? 0;
        const matches = allTrend[allTrend.length - 1]?.matches ?? 0;
        const avgConversionRate = Number((allTrend.reduce((acc, p) => acc + p.conversionRate, 0) / allTrend.length).toFixed(2));
        const summary = {
            range,
            filters: {
                country,
                industry,
                stage,
            },
            pagination: {
                page,
                limit,
                totalPoints: allTrend.length,
                hasMore: start + trend.length < allTrend.length,
            },
            totals: {
                pipelineEur,
                matches,
                avgConversionRate,
            },
            trend,
        };
        this.summaryCache.set(key, { ts: Date.now(), data: summary });
        return summary;
    }
    toCsv(summary) {
        const header = ['date', 'pipeline_eur', 'matches', 'conversion_rate'];
        const rows = summary.trend.map((p) => [p.date, String(p.pipeline), String(p.matches), String(p.conversionRate)]);
        return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
    async toPdfBuffer(summary) {
        const doc = new pdfkit_1.default({ margin: 42 });
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            doc.fontSize(20).text('WinGroX AI Report', { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`Range: ${summary.range}`);
            doc.text(`Pipeline (EUR): ${summary.totals.pipelineEur}`);
            doc.text(`Matches: ${summary.totals.matches}`);
            doc.text(`Avg Conversion Rate: ${summary.totals.avgConversionRate}%`);
            doc.moveDown();
            doc.text(`Filters: country=${summary.filters.country ?? 'all'}, industry=${summary.filters.industry ?? 'all'}, stage=${summary.filters.stage ?? 'all'}`);
            doc.text(`Pagination: page=${summary.pagination.page}, limit=${summary.pagination.limit}, total=${summary.pagination.totalPoints}`);
            doc.moveDown();
            doc.text('Trend Snapshot (first 10 points):');
            summary.trend.slice(0, 10).forEach((p) => {
                doc.text(`${p.date} | pipeline=${p.pipeline} | matches=${p.matches} | conv=${p.conversionRate}%`);
            });
            doc.end();
        });
    }
    getSegments(input) {
        const { range, country, industry, stage } = input;
        const key = JSON.stringify({ range, country, industry, stage });
        const cached = this.segmentCache.get(key);
        if (cached && Date.now() - cached.ts < this.cacheTtlMs) {
            return cached.data;
        }
        const boost = (country ? 1 : 0) + (industry ? 1 : 0) + (stage ? 1 : 0);
        const mk = (keyName, base, idx) => ({
            key: keyName,
            pipelineEur: base + idx * 18_000 + boost * 2_500,
            matches: 10 + idx * 3 + boost,
            avgConversionRate: Number((4.1 + idx * 0.45 + boost * 0.12).toFixed(2)),
        });
        const data = {
            byCountry: [mk('Germany', 210_000, 1), mk('Netherlands', 170_000, 2), mk('UK', 195_000, 3)],
            byIndustry: [mk('SaaS', 240_000, 1), mk('Manufacturing', 185_000, 2), mk('Fintech', 165_000, 3)],
            byStage: [mk('Seed', 150_000, 1), mk('Series A', 220_000, 2), mk('Growth', 260_000, 3)],
        };
        this.segmentCache.set(key, { ts: Date.now(), data });
        return data;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)()
], ReportsService);


/***/ }),

/***/ "./src/modules/users/users.controller.ts":
/*!***********************************************!*\
  !*** ./src/modules/users/users.controller.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./src/modules/users/users.service.ts");
const user_decorator_1 = __webpack_require__(/*! ../../common/decorators/user.decorator */ "./src/common/decorators/user.decorator.ts");
const jwt_guard_1 = __webpack_require__(/*! ../../common/guards/jwt.guard */ "./src/common/guards/jwt.guard.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/common/guards/roles.guard.ts");
const users_dto_1 = __webpack_require__(/*! ./users.dto */ "./src/modules/users/users.dto.ts");
/**
 * Users Controller
 * Endpoints: get profile, list users (admin)
 */
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(user) {
        return {
            success: true,
            data: user,
            timestamp: new Date().toISOString(),
        };
    }
    async getUser(id) {
        const user = await this.usersService.findById(id);
        return {
            success: true,
            data: user,
            timestamp: new Date().toISOString(),
        };
    }
    async listUsers(page = '1', limit = '10') {
        const result = await this.usersService.findAll(Number(page), Number(limit));
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async createUser(dto) {
        try {
            const validated = users_dto_1.CreateUserDTOSchema.parse(dto);
            const result = await this.usersService.create(validated);
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'Invalid payload');
        }
    }
    async updateUser(id, dto) {
        const result = await this.usersService.update(id, dto);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async deleteUser(id) {
        const result = await this.usersService.delete(id);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users (admin/manager only)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create user (admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof Partial !== "undefined" && Partial) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete user (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], UsersController);


/***/ }),

/***/ "./src/modules/users/users.dto.ts":
/*!****************************************!*\
  !*** ./src/modules/users/users.dto.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDTOSchema = exports.UserDTOSchema = void 0;
const zod_1 = __webpack_require__(/*! zod */ "zod");
exports.UserDTOSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']),
    avatar: zod_1.z.string().optional(),
});
exports.CreateUserDTOSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']).default('USER'),
});


/***/ }),

/***/ "./src/modules/users/users.module.ts":
/*!*******************************************!*\
  !*** ./src/modules/users/users.module.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const users_controller_1 = __webpack_require__(/*! ./users.controller */ "./src/modules/users/users.controller.ts");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./src/modules/users/users.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../../common/prisma.service */ "./src/common/prisma.service.ts");
const jwt_guard_1 = __webpack_require__(/*! ../../common/guards/jwt.guard */ "./src/common/guards/jwt.guard.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/common/guards/roles.guard.ts");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const replay_protection_service_1 = __webpack_require__(/*! ../../common/services/replay-protection.service */ "./src/common/services/replay-protection.service.ts");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, prisma_service_1.PrismaService, jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard, jwt_1.JwtService, replay_protection_service_1.ReplayProtectionService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);


/***/ }),

/***/ "./src/modules/users/users.service.ts":
/*!********************************************!*\
  !*** ./src/modules/users/users.service.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../../common/prisma.service */ "./src/common/prisma.service.ts");
const bcryptjs_1 = __webpack_require__(/*! bcryptjs */ "bcryptjs");
/**
 * Users Service
 * Handles user-related business logic
 */
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get user by ID
     */
    async findById(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    /**
     * Get all users (admin only)
     */
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where: { deletedAt: null },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.user.count({ where: { deletedAt: null } }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            hasMore: skip + items.length < total,
        };
    }
    /**
     * Create a new user
     */
    async create(dto) {
        const passwordHash = await (0, bcryptjs_1.hash)(dto.password, 10);
        return this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                role: dto.role,
                password: passwordHash,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    /**
     * Update user profile
     */
    async update(userId, data) {
        await this.findById(userId);
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.email ? { email: data.email } : {}),
                ...(data.name ? { name: data.name } : {}),
                ...(data.role ? { role: data.role } : {}),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    /**
     * Delete user (soft delete)
     */
    async delete(userId) {
        await this.findById(userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() },
        });
        return { deleted: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], UsersService);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "ioredis":
/*!**************************!*\
  !*** external "ioredis" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("ioredis");

/***/ }),

/***/ "pdfkit":
/*!*************************!*\
  !*** external "pdfkit" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("pdfkit");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "zod":
/*!**********************!*\
  !*** external "zod" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("zod");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });
    // API prefix
    app.setGlobalPrefix(process.env.API_PREFIX || 'api');
    // Swagger/OpenAPI documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('WinGroX AI - API')
        .setDescription('Enterprise Growth Intelligence Operating System API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('accounts', 'Account management')
        .addTag('reports', 'Reporting and export endpoints')
        .addTag('health', 'System health')
        .addTag('dashboard', 'Dashboard analytics endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port, () => {
        console.log(`✓ Server running on http://localhost:${port}`);
        console.log(`✓ API docs on http://localhost:${port}/api/docs`);
    });
}
bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

})();

/******/ })()
;