"use strict";
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
var PurchaseIntentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseIntentController = exports.DetectPurchaseIntentDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const purchase_intent_detector_service_1 = require("./purchase-intent-detector.service");
class DetectPurchaseIntentDto {
}
exports.DetectPurchaseIntentDto = DetectPurchaseIntentDto;
let PurchaseIntentController = PurchaseIntentController_1 = class PurchaseIntentController {
    constructor(purchaseIntentDetector) {
        this.purchaseIntentDetector = purchaseIntentDetector;
        this.logger = new common_1.Logger(PurchaseIntentController_1.name);
    }
    async detectPurchaseIntent(detectPurchaseIntentDto) {
        try {
            this.logger.log(`Detecting purchase intent for message: ${detectPurchaseIntentDto.message.substring(0, 50)}...`);
            const result = this.purchaseIntentDetector.detectPurchaseIntent(detectPurchaseIntentDto.message, detectPurchaseIntentDto.context);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to detect purchase intent: ${error.message}`);
            throw error;
        }
    }
};
exports.PurchaseIntentController = PurchaseIntentController;
__decorate([
    (0, common_1.Post)('detect'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Detect purchase intent in user message' }),
    (0, swagger_1.ApiBody)({ type: DetectPurchaseIntentDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Purchase intent detection result',
        schema: {
            type: 'object',
            properties: {
                hasPurchaseIntent: { type: 'boolean' },
                confidence: { type: 'number' },
                intentType: { type: 'string' },
                productReferences: {
                    type: 'array',
                    items: { type: 'string' }
                },
                urgencyLevel: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DetectPurchaseIntentDto]),
    __metadata("design:returntype", Promise)
], PurchaseIntentController.prototype, "detectPurchaseIntent", null);
exports.PurchaseIntentController = PurchaseIntentController = PurchaseIntentController_1 = __decorate([
    (0, common_1.Controller)('purchase-intent'),
    (0, swagger_1.ApiTags)('Purchase Intent Detection'),
    __metadata("design:paramtypes", [purchase_intent_detector_service_1.PurchaseIntentDetectorService])
], PurchaseIntentController);
//# sourceMappingURL=purchase-intent.controller.js.map