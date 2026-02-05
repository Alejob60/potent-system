"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieService = void 0;
const common_1 = require("@nestjs/common");
let CookieService = class CookieService {
    constructor() {
        this.TOKEN_COOKIE_NAME = 'auth-token';
        this.REFRESH_COOKIE_NAME = 'refresh-token';
        this.COOKIE_OPTIONS = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
        };
    }
    setAuthToken(res, payload, expiresIn) {
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + expiresIn);
        res.cookie(this.TOKEN_COOKIE_NAME, JSON.stringify(payload), {
            ...this.COOKIE_OPTIONS,
            expires,
        });
    }
    setRefreshToken(res, token, expiresIn) {
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + expiresIn);
        res.cookie(this.REFRESH_COOKIE_NAME, token, {
            ...this.COOKIE_OPTIONS,
            expires,
        });
    }
    getAuthToken(req) {
        try {
            const token = req.cookies[this.TOKEN_COOKIE_NAME];
            if (!token)
                return null;
            const payload = JSON.parse(token);
            if (payload.expiresAt < Date.now()) {
                return null;
            }
            return payload;
        }
        catch (error) {
            return null;
        }
    }
    getRefreshToken(req) {
        return req.cookies[this.REFRESH_COOKIE_NAME] || null;
    }
    clearAuthCookies(res) {
        res.clearCookie(this.TOKEN_COOKIE_NAME, this.COOKIE_OPTIONS);
        res.clearCookie(this.REFRESH_COOKIE_NAME, this.COOKIE_OPTIONS);
    }
    isAuthenticated(req) {
        return this.getAuthToken(req) !== null;
    }
};
exports.CookieService = CookieService;
exports.CookieService = CookieService = __decorate([
    (0, common_1.Injectable)()
], CookieService);
//# sourceMappingURL=cookie.service.js.map