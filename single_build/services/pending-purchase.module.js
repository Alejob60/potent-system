"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingPurchaseModule = void 0;
const common_1 = require("@nestjs/common");
const pending_purchase_controller_1 = require("./pending-purchase.controller");
const pending_purchase_service_1 = require("./pending-purchase.service");
const redis_module_1 = require("../common/redis/redis.module");
let PendingPurchaseModule = class PendingPurchaseModule {
};
exports.PendingPurchaseModule = PendingPurchaseModule;
exports.PendingPurchaseModule = PendingPurchaseModule = __decorate([
    (0, common_1.Module)({
        imports: [redis_module_1.RedisModule],
        controllers: [pending_purchase_controller_1.PendingPurchaseController],
        providers: [pending_purchase_service_1.PendingPurchaseService],
        exports: [pending_purchase_service_1.PendingPurchaseService],
    })
], PendingPurchaseModule);
